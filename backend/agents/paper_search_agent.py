from google.adk.agents import Agent
from backend.mcp.client import mcp_client

async def search_papers_tool(query: str, limit: int = 5) -> str:
    """
    Search academic papers from arXiv by query keywords.
    
    Args:
        query: Keywords or terms to search for (e.g. 'Federated Learning Healthcare')
        limit: Number of papers to fetch (1-5)
    """
    return await mcp_client.call_tool("papers", "search_papers", {"query": query, "limit": limit})

paper_search_agent = Agent(
    model='gemini-2.5-flash',
    name='paper_search_agent',
    description="Searches academic papers using the PaperSearch MCP tool and formats results.",
    instruction=(
        "You are the Paper Search Agent. Your goal is to search for academic research papers on a given topic.\n"
        "Use the `search_papers_tool` tool with the provided topic or target query to retrieve matching papers.\n"
        "Return a clean markdown list summarizing the papers found. Do NOT hallucinate authors or URLs.\n"
        "For each paper, list:\n"
        "- Title (bold)\n"
        "- Authors\n"
        "- Date\n"
        "- Abstract (briefly state the core idea)\n"
        "- PDF link\n"
    ),
    tools=[search_papers_tool]
)
