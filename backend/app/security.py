import re
import time
from typing import Dict, Tuple
from fastapi import HTTPException, Request

# Simple in-memory rate limiter store: {ip_address: [timestamps]}
RATE_LIMIT_STORE: Dict[str, list] = {}
RATE_LIMIT_WINDOW = 60  # seconds
MAX_REQUESTS = 10       # max requests per window

# Regular expressions for prompt injection heuristics
INJECTION_PATTERNS = [
    r"(?i)ignore\s+(?:all\s+)?previous\s+instructions",
    r"(?i)system\s+prompt",
    r"(?i)you\s+are\s+now\s+a",
    r"(?i)bypass\s+restrictions",
    r"(?i)do\s+anything\s+now",
    r"(?i)dan\s+mode",
    r"(?i)reveal\s+(?:your\s+)?instructions",
    r"(?i)override\s+settings",
]

def validate_research_topic(topic: str) -> str:
    """
    Validates the research topic string.
    Ensures length and characters are appropriate and sanitizes inputs.
    """
    if not topic or not topic.strip():
        raise HTTPException(status_code=400, detail="Research topic cannot be empty.")
    
    # Strip excess whitespaces
    topic = topic.strip()
    
    if len(topic) > 150:
        raise HTTPException(status_code=400, detail="Research topic exceeds maximum length of 150 characters.")
    
    # Prevent basic script tags or html
    clean_topic = re.sub(r"<[^>]*>", "", topic)
    
    # Detect prompt injection attempts
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, clean_topic):
            raise HTTPException(
                status_code=400, 
                detail="Security validation failed: Potential prompt injection detected."
            )
            
    return clean_topic

def sanitize_output(content: str) -> str:
    """
    Sanitizes generated agent outputs to ensure no malicious scripts or code are embedded directly.
    Only basic markdown characters and text should pass without executable tags.
    """
    if not content:
        return ""
    # Strip <script> and other executable web patterns from the text
    sanitized = re.sub(r"(?i)<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>", "[REMOVED SCRIPT]", content)
    sanitized = re.sub(r"(?i)onload\s*=", "on_load_disabled=", sanitized)
    sanitized = re.sub(r"(?i)onerror\s*=", "on_error_disabled=", sanitized)
    return sanitized

def check_rate_limit(request: Request) -> None:
    """
    Simple in-memory rate limiter based on client host IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    if client_ip not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[client_ip] = []
        
    # Filter timestamps within current window
    timestamps = [t for t in RATE_LIMIT_STORE[client_ip] if current_time - t < RATE_LIMIT_WINDOW]
    RATE_LIMIT_STORE[client_ip] = timestamps
    
    if len(timestamps) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=429, 
            detail="Too many requests. Please wait a minute before starting another research session."
        )
        
    RATE_LIMIT_STORE[client_ip].append(current_time)
