import asyncio
import json
import time

AGENTS = [
    "Planner",
    "Paper Search",
    "Summary",
    "GitHub",
    "Comparison",
    "Citation",
    "Report"
]

IS_MOCK_MODE = True


class ResearchOrchestrator:

    def __init__(self, session_id: str, topic: str):
        self.session_id = session_id
        self.topic = topic

    async def _run_agent(self, name, output):

        yield {
            "type": "status",
            "agent": name,
            "status": "running"
        }

        await asyncio.sleep(1)

        yield {
            "type": "log",
            "agent": name,
            "text": output
        }

        await asyncio.sleep(0.5)

        yield {
            "type": "status",
            "agent": name,
            "status": "completed"
        }

    async def run(self):

        outputs = {
            "Planner":
                f"Research plan created for '{self.topic}'.",

            "Paper Search":
                "Found 5 relevant papers.",

            "Summary":
                "Summarized the research papers.",

            "GitHub":
                "Found related GitHub repositories.",

            "Comparison":
                "Generated comparison table.",

            "Citation":
                "Generated APA, IEEE and BibTeX citations.",

            "Report":
                "Final report generated."
        }

        for agent in AGENTS:

            async for event in self._run_agent(
                agent,
                outputs[agent]
            ):

                yield (
                    f"data: {json.dumps(event)}\n\n"
                )

        final = {
            "type": "complete",
            "report": {
                "topic": self.topic,
                "summary":
                    "Research completed successfully.",
                "papers": [
                    "Paper A",
                    "Paper B",
                    "Paper C"
                ],
                "repositories": [
                    "https://github.com/example/project1",
                    "https://github.com/example/project2"
                ]
            }
        }

        yield f"data: {json.dumps(final)}\n\n"

    async def run_pipeline(self):

        async for chunk in self.run():
            yield chunk