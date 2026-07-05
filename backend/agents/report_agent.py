from google.adk.agents import Agent
from backend.mcp.client import mcp_client

async def save_notes_tool(filename: str, content: str) -> str:
    """
    Saves technical notes, summaries, or reports into the workspace files.
    
    Args:
        filename: Target name of the file (e.g. 'federated_learning_report.md')
        content: Markdown content to save
    """
    return await mcp_client.call_tool("filesystem", "save_notes", {"filename": filename, "content": content})

report_agent = Agent(
    model='gemini-2.5-flash',
    name='report_agent',
    description="Aggregates and formats the final research report, saving it via the save_notes tool.",
    instruction=(
        "You are the Final Report Agent. Your role is to compile all the prior findings (plan, paper summaries, github code implementations, comparison tables, and citations) into a publication-ready, professional research report.\n"
        "Assemble the pieces logically into a structured, unified report. Start with an executive summary and conclude with bibliography sections.\n\n"
        "Once compiled, you MUST invoke the `save_notes_tool` tool to write this report to a markdown file (use a filename derived from the topic, like 'federated_learning_report.md').\n"
        "The output returned should confirm the file write status and provide the complete structured report text."
    ),
    tools=[save_notes_tool]
)
