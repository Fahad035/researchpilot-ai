import time
from sqlalchemy import Column, String, Float, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class ResearchSession(Base):
    __tablename__ = "research_sessions"
    
    id = Column(String, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    status = Column(String, default="idle")  # running, completed, failed
    created_at = Column(Float, default=time.time)
    
    # Store aggregated agent outputs
    plan = Column(Text, nullable=True)
    papers = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    github = Column(Text, nullable=True)
    comparison = Column(Text, nullable=True)
    citations = Column(Text, nullable=True)
    report = Column(Text, nullable=True)
    
    logs = relationship("AgentLog", back_populates="session", cascade="all, delete-orphan")

class AgentLog(Base):
    __tablename__ = "agent_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("research_sessions.id"), nullable=False)
    agent_name = Column(String, nullable=False)  # planner, paper_search, summary, github, comparison, citation, report
    status = Column(String, default="waiting")  # waiting, running, processing, completed, failed
    log_text = Column(Text, nullable=True)      # Current streaming text or logs
    updated_at = Column(Float, default=time.time)
    
    session = relationship("ResearchSession", back_populates="logs")
