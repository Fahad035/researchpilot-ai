import os
import uuid
import time
from fastapi import FastAPI, Depends, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from backend.app.database import engine, get_db, Base
from backend.app.models import ResearchSession, AgentLog
from backend.app.security import validate_research_topic, check_rate_limit
from backend.app.orchestrator import ResearchOrchestrator, IS_MOCK_MODE

# Create database tables at startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResearchPilot AI Backend",
    description="Multi-Agent Academic Research Workspace powered by Gemini + ADK + MCP",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    topic: str

@app.get("/api/health")
def health_check():
    """Simple API health check."""
    return {"status": "ok", "timestamp": time.time(), "mock_mode": IS_MOCK_MODE}

@app.post("/api/research")
async def create_research_session(
    req: ResearchRequest, 
    request: Request, 
    db: Session = Depends(get_db)
):
    """
    Creates a new research session, validates the topic, and checks rate limits.
    """
    # Rate limit check
    check_rate_limit(request)
    
    # Topic validation
    sanitized_topic = validate_research_topic(req.topic)
    
    session_id = str(uuid.uuid4())
    
    new_session = ResearchSession(
        id=session_id,
        topic=sanitized_topic,
        status="idle",
        created_at=time.time()
    )
    db.add(new_session)
    db.commit()
    
    return {"session_id": session_id, "topic": sanitized_topic, "mock_mode": IS_MOCK_MODE}

@app.get("/api/research/{session_id}/stream")
async def stream_research_progress(session_id: str, db: Session = Depends(get_db)):
    """
    SSE endpoint that streams agent statuses and output logs in real-time.
    """
    session = db.query(ResearchSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")
        
    orchestrator = ResearchOrchestrator(session_id, session.topic)
    
    return StreamingResponse(
        orchestrator.run_pipeline(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@app.get("/api/research/history")
def get_research_history(db: Session = Depends(get_db)):
    """
    Returns list of historical research sessions.
    """
    sessions = db.query(ResearchSession).order_by(ResearchSession.created_at.desc()).all()
    history = []
    for s in sessions:
        history.append({
            "id": s.id,
            "topic": s.topic,
            "status": s.status,
            "created_at": s.created_at,
            "has_report": s.report is not None
        })
    return history

@app.get("/api/research/{session_id}")
def get_research_details(session_id: str, db: Session = Depends(get_db)):
    """
    Returns the complete structured state of a research session.
    """
    session = db.query(ResearchSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")
        
    # Get associated logs
    logs = db.query(AgentLog).filter_by(session_id=session_id).all()
    logs_data = {
        l.agent_name: {"status": l.status, "log_text": l.log_text, "updated_at": l.updated_at}
        for l in logs
    }
    
    return {
        "id": session.id,
        "topic": session.topic,
        "status": session.status,
        "created_at": session.created_at,
        "plan": session.plan,
        "papers": session.papers,
        "summary": session.summary,
        "github": session.github,
        "comparison": session.comparison,
        "citations": session.citations,
        "report": session.report,
        "agent_logs": logs_data
    }

@app.delete("/api/research/{session_id}")
def delete_research_session(session_id: str, db: Session = Depends(get_db)):
    """
    Deletes a research session and all associated logs.
    """
    session = db.query(ResearchSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")
        
    db.delete(session)
    db.commit()
    return {"status": "success", "message": f"Session {session_id} deleted."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
