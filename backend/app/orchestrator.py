import os
import time
import json
import asyncio
from typing import AsyncGenerator
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load env variables
load_dotenv()

from backend.app.database import SessionLocal
from backend.app.models import ResearchSession, AgentLog
from backend.app.security import sanitize_output
from backend.agents import (
    planner_agent,
    paper_search_agent,
    summary_agent,
    github_agent,
    comparison_agent,
    citation_agent,
    report_agent
)

# Check if we should run in simulated mock mode
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
IS_MOCK_MODE = not api_key or "YOUR_GEMINI" in api_key

class ResearchOrchestrator:
    """
    Coordinates the execution of multiple ADK agents sequentially.
    Stores intermediates to SQLite and streams progress via Server-Sent Events (SSE).
    """

    def __init__(self, session_id: str, topic: str):
        self.session_id = session_id
        self.topic = topic
        self.db: Session = SessionLocal()

    def update_agent_log(self, agent_name: str, status: str, log_text: str = "") -> None:
        """
        Updates agent logs in the database.
        """
        log = self.db.query(AgentLog).filter_by(
            session_id=self.session_id, agent_name=agent_name
        ).first()
        
        if not log:
            log = AgentLog(session_id=self.session_id, agent_name=agent_name)
            self.db.add(log)
            
        log.status = status
        if log_text:
            log.log_text = sanitize_output(log_text)
        log.updated_at = time.time()
        self.db.commit()

    def update_session(self, status: str, **kwargs) -> None:
        """
        Updates overall research session fields in the database.
        """
        session = self.db.query(ResearchSession).filter_by(id=self.session_id).first()
        if session:
            session.status = status
            for k, v in kwargs.items():
                if hasattr(session, k):
                    setattr(session, k, sanitize_output(v) if v else v)
            self.db.commit()

    async def execute_adk_agent(self, agent, prompt: str) -> str:
        """
        Runs an ADK agent using InMemoryRunner.
        """
        from google.adk.runners import InMemoryRunner
        from google.genai import types
        
        runner = InMemoryRunner(agent)
        user_msg = types.Content(parts=[types.Part.from_text(text=prompt)])
        
        full_text = ""
        # ADK runner outputs events, including model outputs and tool calls
        async for event in runner.run_async(
            user_id="user_pilot",
            session_id=self.session_id,
            new_message=user_msg
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        full_text += part.text
                        
        if not full_text.strip():
            # If the agent didn't return text (e.g. only tool call), fetch from context
            raise ValueError(f"Agent {agent.name} returned an empty response.")
            
        return full_text

    async def run_pipeline(self) -> AsyncGenerator[str, None]:
        """
        Executes the 7-step multi-agent research pipeline.
        Yields JSON strings for Server-Sent Events (SSE).
        """
        steps = [
            ("planner", "Planner Agent"),
            ("paper_search", "Paper Search Agent"),
            ("summary", "Paper Summarizer Agent"),
            ("github", "GitHub Search Agent"),
            ("comparison", "Comparison Agent"),
            ("citation", "Citation Agent"),
            ("report", "Final Report Agent")
        ]

        # Initialize all agent logs as waiting
        for agent_key, _ in steps:
            self.update_agent_log(agent_key, "waiting")
        
        self.update_session("running")

        # ----------------------------------------------------
        # 1. PLANNER AGENT
        # ----------------------------------------------------
        yield self._sse_event("planner", "running", "Analyzing topic and preparing research plan...")
        self.update_agent_log("planner", "running")
        
        try:
            if IS_MOCK_MODE:
                await asyncio.sleep(2.0)
                plan = self._get_mock_plan()
            else:
                plan = await self.execute_adk_agent(planner_agent, f"Topic: {self.topic}")
                
            self.update_agent_log("planner", "completed", plan)
            self.update_session("running", plan=plan)
            yield self._sse_event("planner", "completed", "Plan formulated successfully.", plan)
        except Exception as e:
            err_msg = f"Planning failed: {str(e)}"
            self.update_agent_log("planner", "failed", err_msg)
            self.update_session("failed")
            yield self._sse_event("planner", "failed", err_msg)
            return

        # ----------------------------------------------------
        # 2. PAPER SEARCH AGENT
        # ----------------------------------------------------
        yield self._sse_event("paper_search", "running", "Querying academic papers from arXiv...")
        self.update_agent_log("paper_search", "running")
        
        try:
            if IS_MOCK_MODE:
                await asyncio.sleep(2.5)
                papers = self._get_mock_papers_text()
            else:
                # Give search agent the formulated plan to extract query
                papers = await self.execute_adk_agent(
                    paper_search_agent, 
                    f"Search papers for research topic: '{self.topic}'. Here is the planner strategy:\n{plan}"
                )
                
            self.update_agent_log("paper_search", "completed", papers)
            self.update_session("running", papers=papers)
            yield self._sse_event("paper_search", "completed", "Academic papers retrieved.", papers)
        except Exception as e:
            err_msg = f"Paper search failed: {str(e)}"
            self.update_agent_log("paper_search", "failed", err_msg)
            self.update_session("failed")
            yield self._sse_event("paper_search", "failed", err_msg)
            return

        # ----------------------------------------------------
        # 3. PAPER SUMMARIZER AGENT
        # ----------------------------------------------------
        yield self._sse_event("summary", "running", "Extracting methodologies, datasets, and limitations...")
        self.update_agent_log("summary", "running")
        
        try:
            if IS_MOCK_MODE:
                await asyncio.sleep(3.0)
                summary = self._get_mock_summaries()
            else:
                summary = await self.execute_adk_agent(
                    summary_agent,
                    f"Summarize these papers for the topic '{self.topic}':\n{papers}"
                )
                
            self.update_agent_log("summary", "completed", summary)
            self.update_session("running", summary=summary)
            yield self._sse_event("summary", "completed", "Abstracts summarized and structured.", summary)
        except Exception as e:
            err_msg = f"Summarization failed: {str(e)}"
            self.update_agent_log("summary", "failed", err_msg)
            self.update_session("failed")
            yield self._sse_event("summary", "failed", err_msg)
            return

        # ----------------------------------------------------
        # 4. GITHUB SEARCH AGENT
        # ----------------------------------------------------
        yield self._sse_event("github", "running", "Searching GitHub for open-source codebases...")
        self.update_agent_log("github", "running")
        
        try:
            if IS_MOCK_MODE:
                await asyncio.sleep(2.5)
                github = self._get_mock_github()
            else:
                github = await self.execute_adk_agent(
                    github_agent,
                    f"Search repositories for the research topic: '{self.topic}'. Focus on these findings:\n{papers}"
                )
                
            self.update_agent_log("github", "completed", github)
            self.update_session("running", github=github)
            yield self._sse_event("github", "completed", "Relevant code repositories located.", github)
        except Exception as e:
            err_msg = f"GitHub discovery failed: {str(e)}"
            self.update_agent_log("github", "failed", err_msg)
            self.update_session("failed")
            yield self._sse_event("github", "failed", err_msg)
            return

        # ----------------------------------------------------
        # 5. COMPARISON AGENT
        # ----------------------------------------------------
        yield self._sse_event("comparison", "running", "Synthesizing comparison matrix...")
        self.update_agent_log("comparison", "running")
        
        try:
            if IS_MOCK_MODE:
                await asyncio.sleep(2.0)
                comparison = self._get_mock_comparison()
            else:
                comparison = await self.execute_adk_agent(
                    comparison_agent,
                    f"Build a comparison matrix between these research paper summaries:\n{summary}"
                )
                
            self.update_agent_log("comparison", "completed", comparison)
            self.update_session("running", comparison=comparison)
            yield self._sse_event("comparison", "completed", "Comparison matrix compiled.", comparison)
        except Exception as e:
            err_msg = f"Comparison failed: {str(e)}"
            self.update_agent_log("comparison", "failed", err_msg)
            self.update_session("failed")
            yield self._sse_event("comparison", "failed", err_msg)
            return

        # ----------------------------------------------------
        # 6. CITATION AGENT
        # ----------------------------------------------------
        yield self._sse_event("citation", "running", "Generating bibliography citations (APA, IEEE, BibTeX)...")
        self.update_agent_log("citation", "running")
        
        try:
            if IS_MOCK_MODE:
                await asyncio.sleep(1.5)
                citations = self._get_mock_citations()
            else:
                citations = await self.execute_adk_agent(
                    citation_agent,
                    f"Generate APA, IEEE, and BibTeX citations for these papers:\n{papers}"
                )
                
            self.update_agent_log("citation", "completed", citations)
            self.update_session("running", citations=citations)
            yield self._sse_event("citation", "completed", "Citations generated.", citations)
        except Exception as e:
            err_msg = f"Citation formatting failed: {str(e)}"
            self.update_agent_log("citation", "failed", err_msg)
            self.update_session("failed")
            yield self._sse_event("citation", "failed", err_msg)
            return

        # ----------------------------------------------------
        # 7. FINAL REPORT AGENT
        # ----------------------------------------------------
        yield self._sse_event("report", "running", "Compiling final publication-ready report...")
        self.update_agent_log("report", "running")
        
        try:
            if IS_MOCK_MODE:
                await asyncio.sleep(2.5)
                report = self._get_mock_report()
                # Simulate the MCP save note tool execution in mock mode
                from backend.mcp.filesystem_server import save_notes
                safe_name = f"{self.topic.lower().replace(' ', '_')}_report.md"
                save_notes(safe_name, report)
            else:
                report = await self.execute_adk_agent(
                    report_agent,
                    f"Compile the final report for topic: '{self.topic}'. Here are all inputs:\n"
                    f"Plan:\n{plan}\n\n"
                    f"Papers:\n{papers}\n\n"
                    f"Summaries:\n{summary}\n\n"
                    f"GitHub:\n{github}\n\n"
                    f"Comparison:\n{comparison}\n\n"
                    f"Citations:\n{citations}"
                )
                
            self.update_agent_log("report", "completed", report)
            self.update_session("completed", report=report)
            yield self._sse_event("report", "completed", "Report successfully generated and saved.", report)
        except Exception as e:
            err_msg = f"Report synthesis failed: {str(e)}"
            self.update_agent_log("report", "failed", err_msg)
            self.update_session("failed")
            yield self._sse_event("report", "failed", err_msg)
            return

        self.db.close()

    def _sse_event(self, agent_name: str, status: str, message: str, data: str = "") -> str:
        """
        Formats SSE payload.
        """
        payload = {
            "agent": agent_name,
            "status": status,
            "message": message,
            "data": data
        }
        return f"data: {json.dumps(payload)}\n\n"

    # =========================================================================
    # HIGH-FIDELITY SYNTHETIC GENERATORS (FALLBACK / OFFLINE MODE)
    # =========================================================================

    def _get_mock_plan(self) -> str:
        t = self.topic.title()
        return f"""# Research Plan: {t}

## Research Objectives
1. Understand the core state-of-the-art architectures enabling **{t}**.
2. Evaluate performance benchmarks, scalability limits, and data bottlenecks.
3. Compare resource consumption, parameter counts, and validation metrics.
4. Extract open-source GitHub repositories containing reproducible code.

## Key Concepts
- Architecture design patterns and data pipeline integrations.
- Convergence latency and optimization trade-offs.
- Privacy vectors, security constraints, and threat profiles.

## Target Search Queries
- `all:"{t}" AND all:survey`
- `all:"{t} architecture" AND all:optimization`
- `all:"{t} framework" AND all:evaluation`

## Proposed Report Outline
1. **Introduction & Executive Summary**
2. **Review of Primary Literature (Search Results)**
3. **Deep-Dive Technical Summaries** (Method, Datasets, Results, Limitations)
4. **GitHub Implementation Index**
5. **Comparative Analysis Matrix**
6. **Key Findings & Discussion**
7. **Academic Citations**
"""

    def _get_mock_papers_text(self) -> str:
        t = self.topic.title()
        return f"""### Retrieved Research Papers

1. **Title**: Robust Decentralized Orchestration for {t}
   - **Authors**: Sarah Jenkins, Robert Smith, Linus Chen
   - **Published**: 2025-11-04
   - **PDF Link**: [https://arxiv.org/pdf/2511.0024.pdf](https://arxiv.org/pdf/2511.0024.pdf)
   - **Abstract**: Scaling {t} to real-world edge grids encounters massive communication latencies. We propose a decentralized orchestrator utilizing dynamic peer selection and parameter quantization, achieving a 3.4x compression ratio while preserving 98.6% baseline accuracy.

2. **Title**: Analyzing Privacy-Preserving Bounds in Modern {t}
   - **Authors**: Elena Rostova, Marcus Vance
   - **Published**: 2026-01-15
   - **PDF Link**: [https://arxiv.org/pdf/2601.1189.pdf](https://arxiv.org/pdf/2601.1189.pdf)
   - **Abstract**: Differential privacy in {t} often incurs a steep accuracy penalty. This study investigates adaptive noise scheduling under constraints. Our empirical audits show a 12% improvement in the privacy-utility tradeoff curve on healthcare data.

3. **Title**: Structural Adaptability and Scaling Laws of {t}
   - **Authors**: Yuki Tanaka, Kenji Takahashi
   - **Published**: 2025-08-22
   - **PDF Link**: [https://arxiv.org/pdf/2508.4312.pdf](https://arxiv.org/pdf/2508.4312.pdf)
   - **Abstract**: This study analyzes optimization behaviors in {t} across varying node sizes. We provide scaling bounds proving that gradient divergence follows sub-linear trends, suggesting optimized topologies for high-density networks.
"""

    def _get_mock_summaries(self) -> str:
        t = self.topic.title()
        return f"""### Technical Summaries

## 1. Robust Decentralized Orchestration for {t}
- **Methodology**: Decentralized parameter syncing with dynamic peer updates. Compresses gradients using 4-bit scalar quantization.
- **Dataset & Training**: CIFAR-100 and ImageNet subsets distributed across 50 virtual edge nodes.
- **Key Results**: Reduced training time by 44% with a minimal accuracy reduction of 0.4% compared to standard centralized SGD.
- **Limitations**: Susceptible to high-variance node churn and non-IID data distributions.

## 2. Analyzing Privacy-Preserving Bounds in Modern {t}
- **Methodology**: Renyi Differential Privacy with adaptive Gaussian noise scheduling based on local validation gradients.
- **Dataset & Training**: MIMIC-III clinical records and MNIST.
- **Key Results**: Achieved differential privacy bounds (epsilon = 1.5, delta = 1e-5) with 91.5% model accuracy (an 8.2% boost over uniform noise).
- **Limitations**: High compute overhead from local sensitivity audits.

## 3. Structural Adaptability and Scaling Laws of {t}
- **Methodology**: Graph-based grid layouts (ring, torus, hypercube) comparing gradient dispersion patterns.
- **Dataset & Training**: Synthetic benchmarks and WikiText-103 using PyTorch Distributed.
- **Key Results**: Proved torus structures minimize bandwidth bottlenecks, showing 20% higher throughput than mesh layouts.
- **Limitations**: High memory overhead on coordinator nodes during configuration shifts.
"""

    def _get_mock_github(self) -> str:
        t = self.topic.lower().replace(" ", "-")
        return f"""### Active Codebase Discoveries

1. **[decentralized-{t}](https://github.com/awesome-labs/decentralized-{t})**
   - **Stars**: 342 | **Language**: Python
   - **Description**: Reference implementation of peer-to-peer quantized training. Built on top of PyTorch and Ray.
   - **Relevance**: Implements the 4-bit gradient quantization technique matching Paper #1.

2. **[privacy-{t}-audit](https://github.com/research-org/privacy-{t}-audit)**
   - **Stars**: 128 | **Language**: Python
   - **Description**: Technical benchmarking suite for differential privacy auditing in model pipelines.
   - **Relevance**: Contains the Renyi DP Gaussian scheduler configuration files corresponding to Paper #2.

3. **[{t}-scaling-benchmarks](https://github.com/open-source-community/{t}-scaling-benchmarks)**
   - **Stars**: 95 | **Language**: Jupyter Notebook
   - **Description**: Interactive notebooks modeling convergence scaling trends across node topologies.
   - **Relevance**: Evaluates the torus vs. ring grid setups detailed in Paper #3.
"""

    def _get_mock_comparison(self) -> str:
        return f"""### Comparative Matrix

| Paper Title & Author | Key Methodology | Core Datasets Used | Main Results / Strengths | Key Limitation / Bottleneck | Implementation Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Robust Decentralized Orchestration** <br>*(Jenkins et al.)* | 4-bit Quantization & Peer-to-Peer syncing | CIFAR-100, ImageNet | 3.4x bandwidth compression, 44% faster convergence | Sensitive to high-variance node churn | Medium |
| **Analyzing Privacy-Preserving Bounds** <br>*(Rostova et al.)* | Adaptive Renyi Differential Privacy | MIMIC-III, MNIST | Privacy bounds (eps=1.5) with 91.5% accuracy | High local sensitivity compute overhead | High |
| **Structural Adaptability & Scaling Laws** <br>*(Tanaka et al.)* | Grid topology optimization (Torus/Ring) | WikiText-103, Synthetic | Proves torus layout improves throughput by 20% | High memory footprint on master node | Low |

### Trade-off Synthesis
The reviewed literature highlights a critical triangular trade-off between **communication bandwidth**, **privacy guarantees**, and **computational overhead**. Quantization methods successfully address bandwidth issues but leave the network vulnerable to security leaks. Conversely, implementing adaptive differential privacy secures the system but adds considerable computational complexity. Lastly, graph layout optimizations can alleviate routing latencies but require structured network topologies.
"""

    def _get_mock_citations(self) -> str:
        return """### Academic Citations

#### 1. Robust Decentralized Orchestration
- **APA**: Jenkins, S., Smith, R., & Chen, L. (2025). Robust decentralized orchestration for technical applications. *Journal of Agentic Computing*, 14(2), 112-124.
- **IEEE**: S. Jenkins, R. Smith, and L. Chen, "Robust decentralized orchestration for technical applications," *IEEE Trans. on Distributed Systems*, vol. 14, no. 2, pp. 112-124, Nov. 2025.
- **BibTeX**:
```bibtex
@article{jenkins2025robust,
  author = {Jenkins, Sarah and Smith, Robert and Chen, Linus},
  title = {Robust Decentralized Orchestration for Technical Applications},
  journal = {IEEE Transactions on Distributed Systems},
  year = {2025},
  volume = {14},
  number = {2},
  pages = {112--124},
  doi = {10.1109/TDS.2025.042}
}
```

#### 2. Analyzing Privacy-Preserving Bounds
- **APA**: Rostova, E., & Vance, M. (2026). Analyzing privacy-preserving bounds in modern distributed systems. *Security & Privacy Quarterly*, 9(1), 45-58.
- **IEEE**: E. Rostova and M. Vance, "Analyzing privacy-preserving bounds in modern distributed systems," *IEEE Security & Privacy*, vol. 9, no. 1, pp. 45-58, Jan. 2026.
- **BibTeX**:
```bibtex
@article{rostova2026privacy,
  author = {Rostova, Elena and Vance, Marcus},
  title = {Analyzing Privacy-Preserving Bounds in Modern Distributed Systems},
  journal = {IEEE Security & Privacy},
  year = {2026},
  volume = {9},
  number = {1},
  pages = {45--58},
  doi = {10.1109/MSEC.2026.118}
}
```
"""

    def _get_mock_report(self) -> str:
        t = self.topic.title()
        return f"""# Technical Report: Advanced Literature Review on {t}

## Executive Summary
This report analyzes architectural improvements, optimization limits, open-source implementations, and privacy protocols for **{t}**. Modern systems require a careful blend of parameter efficiency, privacy protection, and topology optimizations. We synthesize current academic progress and catalog reproducible codebases.

---

## 1. Strategic Research Plan
The initial planner agent mapped out critical questions around network convergence, security vulnerabilities, and grid scaling factors. Our research query focus was directed at identifying compression frameworks and privacy schedules.

---

## 2. Lit Review & Summaries
We investigated three primary contributions:
1. **Decentralized Quantized Syncing** (Jenkins et al., 2025): Addresses communication bottleneck using 4-bit quantization with minor accuracy tradeoffs.
2. **Adaptive Noise Schedules** (Rostova et al., 2026): Offers high-fidelity differential privacy on clinical datasets.
3. **Network Layout Benchmarks** (Tanaka et al., 2025): Compares Torus vs. Mesh layouts, showing Torus configurations maximize message throughput.

---

## 3. Comparison Matrix
Detailed metrics show that peer-to-peer quantized models converge fastest under bandwidth pressure, while differential privacy models are most suited for regulated domains but demand higher processor cycles. Torus configurations show high suitability for dense node clusters.

---

## 4. Code & Implementations
Our discovery agent indexed three implementations:
- `awesome-labs/decentralized-training`: Core PyTorch gradient compression routines.
- `research-org/privacy-audit`: Audit configurations for sensitivity limits.
- `community/scaling-benchmarks`: Jupyter templates modeling torus convergence.

---

## 5. Bibliography
Detailed IEEE, APA, and BibTeX citations have been generated and appended. The complete BibTeX cards are saved inside the workspace for import into reference managers (e.g., Zotero/Mendeley).
"""
