<div align="center">

# 🚀 ResearchPilot AI

### Autonomous Multi-Agent Research Assistant powered by Google Gemini, Google ADK & MCP

<p align="center">
  <img src="https://img.shields.io/badge/Google-Gemini%202.5-blue?style=for-the-badge&logo=google">
  <img src="https://img.shields.io/badge/Google-ADK-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/MCP-Protocol-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite">
</p>

**AI Agents: Intensive Vibe Coding Capstone Project**

Transform hours of academic research into minutes using autonomous AI agents.

</div>

---

# 📖 Overview

ResearchPilot AI is an autonomous multi-agent research assistant that automates the complete research workflow.

Instead of manually searching research papers, reading lengthy publications, finding GitHub implementations, comparing approaches, generating citations, and writing reports, users simply enter a research topic and the AI agent pipeline performs the entire process automatically.

The project demonstrates how multiple specialized AI agents can collaborate to solve a real-world research problem using Google Gemini, Google ADK, and Model Context Protocol (MCP).

---

# 🎯 Problem Statement

Researchers, students, developers, and professionals spend countless hours:

- Searching academic papers
- Reading lengthy research articles
- Finding implementation repositories
- Comparing research approaches
- Preparing citations
- Writing technical reports

This manual workflow is repetitive, time-consuming, and inefficient.

ResearchPilot AI automates the entire process using autonomous AI agents.

---

# ✨ Features

## 🧠 Autonomous Multi-Agent Workflow

✔ Planner Agent

✔ Paper Search Agent

✔ Summary Agent

✔ GitHub Agent

✔ Comparison Agent

✔ Citation Agent

✔ Report Generation Agent

---

## 📚 Academic Research

- Search latest ArXiv papers
- Retrieve abstracts
- Organize research findings
- Summarize papers automatically

---

## 💻 GitHub Repository Discovery

Automatically finds:

- Open-source implementations
- Research code
- AI projects
- Related repositories

---

## 📄 Automatic Technical Report Generation

Creates professional reports containing:

- Introduction
- Literature Review
- Methodology
- Comparison Matrix
- GitHub Resources
- Future Scope
- References

---

## 📑 Citation Generation

Automatically generates structured references for all discovered papers.

---

## 📁 Export Reports

Supports:

- Markdown (.md)
- PDF (Browser Print)

---

## ⚡ Live Multi-Agent Execution

Watch every AI agent execute in real time.

Each agent displays:

- Current status
- Execution logs
- Progress
- Output

---

# 🏗️ System Architecture

```
                   User Query
                        │
                        ▼
               Planner Agent
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
 Paper Search MCP                 GitHub Search MCP
        │                               │
        └───────────────┬───────────────┘
                        ▼
                 Summary Agent
                        ▼
               Comparison Agent
                        ▼
                Citation Agent
                        ▼
                  Report Agent
                        ▼
             Filesystem + Database
                        ▼
                 React Dashboard
```

---

# 🤖 Multi-Agent Pipeline

## 1️⃣ Planner Agent

Creates an execution strategy based on the research topic.

---

## 2️⃣ Paper Search Agent

Uses MCP tools to retrieve relevant research papers from ArXiv.

---

## 3️⃣ Summary Agent

Uses Google Gemini to summarize all discovered papers.

---

## 4️⃣ GitHub Agent

Searches GitHub repositories related to the research topic.

---

## 5️⃣ Comparison Agent

Compares research papers based on:

- Methods
- Strengths
- Weaknesses
- Results

---

## 6️⃣ Citation Agent

Generates structured citations.

---

## 7️⃣ Report Agent

Produces a professional technical report combining all previous outputs.

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

---

## Backend

- FastAPI
- Python
- SQLite
- SQLAlchemy

---

## AI Technologies

- Google Gemini 2.5 Flash
- Google Agent Development Kit (ADK)
- Model Context Protocol (MCP)

---

## MCP Servers

- ArXiv MCP
- GitHub MCP
- Filesystem MCP

---

# 📂 Project Structure

```
ResearchPilot-AI/

│
├── backend/
│   ├── app/
│   │   ├── orchestrator.py
│   │   ├── gemini_service.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── api.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │
│   ├── api/
│   ├── hooks/
│   ├── components/
│   │   ├── landing/
│   │   ├── workspace/
│   │   ├── layouts/
│   │   └── common/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── screenshots/
│
├── README.md
│
└── LICENSE
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ResearchPilot-AI.git

cd ResearchPilot-AI
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate
```

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create .env

```env
GOOGLE_API_KEY=YOUR_API_KEY

DATABASE_URL=sqlite:///./researchpilot.db
```

Run backend

```bash
uvicorn app.main:app --reload
```

Backend runs at

```
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# 🚀 Usage

1. Open the frontend.

2. Enter any research topic.

Example:

```
Retrieval Augmented Generation
```

3. Click

```
Start Research
```

4. Watch the AI agents execute.

5. Review:

- Research papers
- GitHub repositories
- Summaries
- Comparison
- Citations
- Final report

6. Export the generated report.

---

# 📸 Screenshots

Add screenshots here.

Example:

```
screenshots/

landing.png

pipeline.png

papers.png

github.png

comparison.png

report.png
```

---

# 🎥 Demo Video

Add your YouTube demo link here.

Example

```
https://youtu.be/your-demo-link
```

---

# 🌟 Future Improvements

- Semantic Search using Vector Databases
- PDF Upload & Analysis
- Multi-LLM Support
- Research Memory
- Collaborative Research Sessions
- RAG-based Knowledge Base
- Interactive Citation Editing
- Report Templates
- Presentation Generation
- AI-powered Research Recommendations

---

# 👨‍💻 Author

**Md Fahad**

GitHub:

https://github.com/Fahad035

LinkedIn:

https://linkedin.com/in/YOUR_LINKEDIN

---

# 🙏 Acknowledgements

- Google Gemini
- Google Agent Development Kit (ADK)
- Model Context Protocol (MCP)
- ArXiv
- GitHub
- FastAPI
- React
- Tailwind CSS
- Kaggle AI Agents Intensive Vibe Coding Capstone

---

# 📜 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a Star!

Built with ❤️ using Google Gemini, Google ADK and MCP.

</div>
