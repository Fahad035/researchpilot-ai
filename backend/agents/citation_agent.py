from google.adk.agents import Agent

citation_agent = Agent(
    model='gemini-2.5-flash',
    name='citation_agent',
    description="Generates bibliography and citations in APA, IEEE, and BibTeX styles.",
    instruction=(
        "You are the Citation Agent.\n"
        "Your task is to take the list of retrieved papers (title, authors, year, link) and generate accurate academic citations.\n"
        "For each paper, output the following formats inside expandable markdown tags or clean lists:\n"
        "- **APA Format**\n"
        "- **IEEE Format**\n"
        "- **BibTeX Block** (enclosed in a markdown code block ````bibtex ... ````)\n\n"
        "Make sure to follow correct citation mechanics. Format the BibTeX keys using lowercase first-author name and publication year (e.g. @article{author2026topic...})."
    ),
    tools=[]
)
