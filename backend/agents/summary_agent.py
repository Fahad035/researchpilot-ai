from google.adk.agents import Agent
from backend.mcp.client import mcp_client

async def read_pdf_tool(filepath: str) -> str:
    """
    Read or extract text content from a PDF file in the notes or workspace.
    
    Args:
        filepath: Full file path or name of the PDF file
    """
    return await mcp_client.call_tool("filesystem", "read_pdf", {"filepath": filepath})

summary_agent = Agent(
    model='gemini-2.5-flash',
    name='summary_agent',
    description="Summarizes research papers, extracting methodology, dataset, results, and limitations.",
    instruction=(
        "You are the Paper Summarizer Agent. Your goal is to generate structured, analytical summaries for research papers.\n"
        "You will be given a list of papers or abstracts. If a path to a PDF file is available, you may use the `read_pdf_tool` tool to read it.\n\n"
        "For each paper, compile a structured summary covering exactly:\n"
        "1. ## [Paper Title]\n"
        "2. **Methodology**: What mathematical, technical, or procedural method did the authors propose?\n"
        "3. **Dataset & Training**: What datasets, benchmarks, or environments were used for training and validation?\n"
        "4. **Key Results**: What was the quantitative and qualitative performance (e.g. accuracy, speedup)?\n"
        "5. **Limitations & Future Work**: What are the reported issues, scaling boundaries, or security flaws?\n\n"
        "Ensure your summary is dense, technical, and objective."
    ),
    tools=[read_pdf_tool]
)
