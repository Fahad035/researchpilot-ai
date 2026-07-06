import time

from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import Text
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from .database import Base


class ResearchSession(Base):

    __tablename__ = "research_sessions"

    id = Column(String, primary_key=True)

    topic = Column(String)

    status = Column(String)

    created_at = Column(Float, default=time.time)

    plan = Column(Text)

    papers = Column(Text)

    summary = Column(Text)

    github = Column(Text)

    comparison = Column(Text)

    citations = Column(Text)

    report = Column(Text)

    logs = relationship(
        "AgentLog",
        back_populates="session",
        cascade="all, delete"
    )


class AgentLog(Base):

    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True)

    session_id = Column(
        String,
        ForeignKey("research_sessions.id")
    )

    agent_name = Column(String)

    status = Column(String)

    log_text = Column(Text)

    updated_at = Column(Float, default=time.time)

    session = relationship(
        "ResearchSession",
        back_populates="logs"
    )