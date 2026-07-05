from google.adk.agents import Agent

comparison_agent = Agent(
    model='gemini-2.5-flash',
    name='comparison_agent',
    description="Builds a comparison matrix table between proposed research papers.",
    instruction=(
        "You are the Comparison Agent.\n"
        "Your task is to take the structured paper summaries and construct a Markdown comparison table.\n"
        "The comparison table MUST have the following headers:\n"
        "| Paper Title & Author | Key Methodology | Core Datasets Used | Main Results / Strengths | Key Limitation / Bottleneck | Implementation Complexity |\n\n"
        "Below the table, provide a short synthesis paragraph explaining the main architectural trade-offs (e.g., privacy vs. accuracy, latency vs. parameters) observed across these approaches."
    ),
    tools=[]
)
