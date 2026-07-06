import uuid
import time

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import ResearchSession
from .schemas import ResearchRequest
from .security import (
    validate_research_topic,
    check_rate_limit
)
from .orchestrator import (
    ResearchOrchestrator,
    IS_MOCK_MODE
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResearchPilot AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "ResearchPilot AI Backend Running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "mock_mode": IS_MOCK_MODE
    }


@app.post("/api/research")
def create_session(
    req: ResearchRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # Security checks
    check_rate_limit(request)

    topic = validate_research_topic(req.topic)

    session = ResearchSession(
        id=str(uuid.uuid4()),
        topic=topic,
        status="created",
        created_at=time.time()
    )

    db.add(session)
    db.commit()

    return {
        "session_id": session.id,
        "topic": topic
    }


@app.get("/api/research/{session_id}/stream")
async def stream_research(
    session_id: str,
    db: Session = Depends(get_db)
):
    session = (
        db.query(ResearchSession)
        .filter_by(id=session_id)
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Research session not found"
        )

    # Mark session as running
    session.status = "running"
    db.commit()

    orchestrator = ResearchOrchestrator(
        session_id=session.id,
        topic=session.topic
    )

    return StreamingResponse(
        orchestrator.run(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )


@app.get("/api/research/history")
def get_history(
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(ResearchSession)
        .order_by(ResearchSession.created_at.desc())
        .all()
    )

    return [
        {
            "id": s.id,
            "topic": s.topic,
            "status": s.status,
            "created_at": s.created_at
        }
        for s in sessions
    ]


@app.get("/api/research/{session_id}")
def get_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    session = (
        db.query(ResearchSession)
        .filter_by(id=session_id)
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Research session not found"
        )

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
        "report": session.report
    }


@app.delete("/api/research/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    session = (
        db.query(ResearchSession)
        .filter_by(id=session_id)
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Research session not found"
        )

    db.delete(session)
    db.commit()

    return {
        "status": "success",
        "message": "Research session deleted."
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )