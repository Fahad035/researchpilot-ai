import uuid
import time

from fastapi import FastAPI
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from .database import Base
from .database import engine
from .database import get_db

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

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResearchPilot AI"
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

    check_rate_limit(request)

    topic = validate_research_topic(
        req.topic
    )

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
async def stream(
    session_id: str,
    db: Session = Depends(get_db)
):

    session = db.query(
        ResearchSession
    ).filter_by(
        id=session_id
    ).first()

    if session is None:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    orchestrator = ResearchOrchestrator(

        session.id,

        session.topic

    )

    return StreamingResponse(

        orchestrator.run_pipeline(),

        media_type="text/event-stream"

    )


@app.get("/api/research/history")
def history(
    db: Session = Depends(get_db)
):

    sessions = db.query(
        ResearchSession
    ).all()

    return sessions


if __name__ == "__main__":

    import uvicorn

    uvicorn.run(

        "app.main:app",

        host="0.0.0.0",

        port=8000,

        reload=True

    )