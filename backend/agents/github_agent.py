from google.adk.agents import Agent
from backend.mcp.client import mcp_client

async def search_github_tool(query: str, limit: int = 5) -> str:
    """
    Search GitHub repositories for open-source implementations matching the topic or research paper names.
    
    Args:
        query: Repository search keywords (e.g. 'Federated Learning Healthcare PyTorch')
        limit: Number of repositories to fetch (1-5)
    """
    return await mcp_client.call_tool("github", "search_github", {"query": query, "limit": limit})

github_agent = Agent(
    model='gemini-2.5-flash',
    name='github_agent',
    description="Discovers active GitHub code implementations matching the research topic.",
    instruction=(
        "You are the GitHub Agent. Your role is to find open-source repositories matching the research papers or topic.\n"
        "Use the `search_github_tool` tool with relevant keywords to locate active projects.\n"
        "Return a markdown list of repositories. For each repository, provide:\n"
        "- Name (linked to github URL if available)\n"
        "- Star count\n"
        "- Primary language\n"
        "- Short summary of how this code relates to the research topic (focus on framework e.g. PyTorch/TensorFlow, model weight loading, and reproducibility)."
    ),
    tools=[search_github_tool]
)
