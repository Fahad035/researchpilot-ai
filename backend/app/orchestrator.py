import json
import asyncio
import traceback
from datetime import datetime

from .gemini_service import gemini_service
from  mcp_servers.client import mcp_client
from .database import SessionLocal
from .models import ResearchSession

IS_MOCK_MODE = False

AGENTS = [
    "Planner",
    "Paper Search",
    "Summary",
    "GitHub",
    "Comparison",
    "Citation",
    "Report"
]


class ResearchOrchestrator:

    def __init__(self, session_id: str, topic: str):
        self.session_id = session_id
        self.topic = topic

        self.plan = ""
        self.paper_results = ""
        self.summary = ""
        self.github = ""
        self.comparison = ""
        self.citations = ""
        self.report = ""

    ########################################################

    async def emit_status(
        self,
        agent,
        status
    ):

        event = {
            "type": "status",
            "agent": agent,
            "status": status,
            "time": datetime.now().isoformat()
        }

        return f"data: {json.dumps(event)}\n\n"

    ########################################################

    async def emit_log(
        self,
        agent,
        text
    ):

        event = {
            "type": "log",
            "agent": agent,
            "text": text
        }

        return f"data: {json.dumps(event)}\n\n"

    ########################################################

    async def emit_complete(self):

        event = {

            "type": "complete",

            "report": {

                "topic": self.topic,

                "plan": self.plan,

                "papers": self.paper_results,

                "summary": self.summary,

                "github": self.github,

                "comparison": self.comparison,

                "citations": self.citations,

                "report": self.report

            }

        }

        return f"data: {json.dumps(event)}\n\n"

        ########################################################
    # MAIN RESEARCH PIPELINE
    ########################################################

    async def run(self):

        try:

            ####################################################
            # 1. Planner Agent
            ####################################################

            yield await self.emit_status("Planner", "running")

            self.plan = gemini_service.create_plan(
                self.topic
            )

            yield await self.emit_log(
                "Planner",
                self.plan
            )

            yield await self.emit_status(
                "Planner",
                "completed"
            )

            await asyncio.sleep(0.5)

            ####################################################
            # 2. Paper Search MCP
            ####################################################

            yield await self.emit_status(
                "Paper Search",
                "running"
            )

            self.paper_results = await mcp_client.call_tool(

                server_name="papers",

                tool_name="search_papers",

                arguments={
                    "query": self.topic,
                    "limit": 5
                }

            )

            yield await self.emit_log(
                "Paper Search",
                self.paper_results
            )

            yield await self.emit_status(
                "Paper Search",
                "completed"
            )

            await asyncio.sleep(0.5)

            ####################################################
            # 3. Summary Agent
            ####################################################

            yield await self.emit_status(
                "Summary",
                "running"
            )

            self.summary = gemini_service.summarize_papers(
                self.paper_results
            )

            yield await self.emit_log(
                "Summary",
                self.summary
            )

            yield await self.emit_status(
                "Summary",
                "completed"
            )

            await asyncio.sleep(0.5)

            ####################################################
            # 4. Github MCP
            ####################################################

            yield await self.emit_status(
                "GitHub",
                "running"
            )

            self.github = await mcp_client.call_tool(

                server_name="github",

                tool_name="search_github",

                arguments={
                    "query": self.topic,
                    "limit": 5
                }

            )

            yield await self.emit_log(
                "GitHub",
                self.github
            )

            yield await self.emit_status(
                "GitHub",
                "completed"
            )

            await asyncio.sleep(0.5)

            ####################################################
            # 5. Comparison Agent
            ####################################################

            yield await self.emit_status(
                "Comparison",
                "running"
            )

            self.comparison = gemini_service.compare(

                self.paper_results

            )

            yield await self.emit_log(

                "Comparison",

                self.comparison

            )

            yield await self.emit_status(

                "Comparison",

                "completed"

            )

            await asyncio.sleep(0.5)

            ####################################################
            # 6. Citation Agent
            ####################################################

            yield await self.emit_status(

                "Citation",

                "running"

            )

            self.citations = gemini_service.citations(

                self.paper_results

            )

            yield await self.emit_log(

                "Citation",

                self.citations

            )

            yield await self.emit_status(

                "Citation",

                "completed"

            )

            await asyncio.sleep(0.5)

                ####################################################
            # 7. Report Agent
            ####################################################

            yield await self.emit_status(
                "Report",
                "running"
            )

            self.report = gemini_service.final_report(
                topic=self.topic,
                plan=self.plan,
                papers=self.paper_results,
                summary=self.summary,
                github=self.github,
                comparison=self.comparison,
                citations=self.citations
            )

            yield await self.emit_log(
                "Report",
                self.report
            )

            ####################################################
            # 8. Save Report using Filesystem MCP
            ####################################################

            filename = (
                self.topic.lower()
                .replace(" ", "_")
                .replace("/", "_")
                + ".md"
            )

            save_result = await mcp_client.call_tool(
                server_name="filesystem",
                tool_name="save_notes",
                arguments={
                    "filename": filename,
                    "content": self.report
                }
            )

            yield await self.emit_log(
                "Filesystem",
                save_result
            )

            yield await self.emit_status(
                "Report",
                "completed"
            )

            # Save everything
            self.save_to_database()

            ####################################################
            # Final Event
            ####################################################

            yield await self.emit_complete()

        except Exception as e:

            traceback.print_exc()

            db = SessionLocal()

            try:

                session = (
                    db.query(ResearchSession)
                    .filter_by(id=self.session_id)
                    .first()
                )

                if session:

                    session.status = "failed"

                    db.commit()

            finally:

                db.close()

            error = {

                "type": "error",

                "message": str(e)

            }

            yield f"data: {json.dumps(error)}\n\n"
########################################################
# Save Results
########################################################

def save_to_database(self):

    db = SessionLocal()

    try:

        session = (
            db.query(ResearchSession)
            .filter_by(id=self.session_id)
            .first()
        )

        if session:

            session.status = "completed"

            session.plan = self.plan

            session.papers = self.paper_results

            session.summary = self.summary

            session.github = self.github

            session.comparison = self.comparison

            session.citations = self.citations

            session.report = self.report

            db.commit()

    except Exception as e:

        print("Database Save Error:", e)

        db.rollback()

    finally:

        db.close()
    ########################################################
    # FastAPI Streaming Endpoint
    ########################################################

    async def run_pipeline(self):

        async for chunk in self.run():
            yield chunk    