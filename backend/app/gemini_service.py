import os
import logging
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger("ResearchPilot-Gemini")
logging.basicConfig(level=logging.INFO)


class GeminiService:
    """
    Wrapper around Google Gemini API.
    Used by all research agents.
    """

    def __init__(self):

        api_key = (
            os.getenv("GOOGLE_API_KEY")
            or os.getenv("GEMINI_API_KEY")
        )

        if not api_key:
            raise RuntimeError(
                "GOOGLE_API_KEY not found in .env"
            )

        self.client = genai.Client(
            api_key=api_key
        )

        self.model = "gemini-2.5-flash"

    ####################################################################
    # Generic Generation
    ####################################################################

    def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> str:

        try:

            response = self.client.models.generate_content(

                model=self.model,

                contents=prompt,

                config=types.GenerateContentConfig(

                    temperature=temperature,

                    max_output_tokens=max_tokens,
                ),
            )

            if response.text:
                return response.text.strip()

            return ""

        except Exception as e:

            logger.exception(e)

            return f"Gemini Error : {str(e)}"

    ####################################################################
    # Planner
    ####################################################################

    def create_plan(
        self,
        topic: str
    ) -> str:

        prompt = f"""
You are Planner Agent.

Topic:

{topic}

Create a research execution plan.

Return markdown only.

Include:

# Objectives

# Search Strategy

# Keywords

# GitHub Search Terms

# Final Report Outline

Keep it concise.
"""

        return self.generate(prompt)

    ####################################################################
    # Summary Agent
    ####################################################################

    def summarize_papers(
        self,
        papers: str
    ) -> str:

        prompt = f"""
You are Summary Agent.

Summarize the following papers.

Focus on:

• Contributions

• Methods

• Results

• Limitations

Papers:

{papers}

Return markdown.
"""

        return self.generate(prompt)

    ####################################################################
    # Comparison Agent
    ####################################################################

    def compare(
        self,
        papers: str
    ) -> str:

        prompt = f"""
Create a comparison table.

Compare:

Method

Dataset

Accuracy

Advantages

Limitations

Input:

{papers}

Return markdown table.
"""

        return self.generate(prompt)

    ####################################################################
    # Citation Agent
    ####################################################################

    def citations(
        self,
        papers: str
    ) -> str:

        prompt = f"""
Generate

APA

IEEE

BibTeX

citations for

{papers}

Return markdown.
"""

        return self.generate(prompt)

    ####################################################################
    # Report Agent
    ####################################################################

    def final_report(
        self,
        topic: str,
        plan: str,
        papers: str,
        summary: str,
        github: str,
        comparison: str,
        citations: str
    ) -> str:

        prompt = f"""
Generate a professional research report.

Topic:

{topic}

Research Plan:

{plan}

Papers:

{papers}

Summary:

{summary}

Github Projects:

{github}

Comparison:

{comparison}

Citations:

{citations}

Produce a beautiful markdown report.

Include:

# Title

# Abstract

# Introduction

# Literature Review

# GitHub Projects

# Comparison

# Future Work

# References
"""

        return self.generate(prompt)


########################################################################

gemini_service = GeminiService()