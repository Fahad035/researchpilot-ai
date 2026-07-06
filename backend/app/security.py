from fastapi import HTTPException
from fastapi import Request


def validate_research_topic(topic: str):

    topic = topic.strip()

    if len(topic) < 3:

        raise HTTPException(
            status_code=400,
            detail="Topic too short"
        )

    if len(topic) > 300:

        raise HTTPException(
            status_code=400,
            detail="Topic too long"
        )

    return topic


def check_rate_limit(request: Request):

    return True