"""
AI Quiz Generator Service — Uses local Ollama LLM to auto-generate quiz questions
from existing Topic content.

Input: A Topic's concatenated content sections.
Output: An array of draft questions that admins can review, edit, and save.
"""

import json
import logging
from typing import List, Dict, Any
from uuid import UUID

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.config import settings
from app.modules.topics.models import Topic

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = settings.OLLAMA_BASE_URL
OLLAMA_MODEL = settings.OLLAMA_MODEL


async def generate_questions_for_topic(
    db: AsyncSession,
    topic_id: UUID,
    num_mcq: int = 3,
    num_short_answer: int = 1,
) -> Dict[str, Any]:
    """
    Fetches a topic's content, sends it to Ollama, and returns draft questions.
    """
    # Fetch topic with contents
    query = select(Topic).options(selectinload(Topic.contents)).where(Topic.id == topic_id)
    result = await db.execute(query)
    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    # Build text payload from topic contents
    text_parts = [f"Topic: {topic.title}"]
    for content in topic.contents:
        cjson = content.content_json
        ctype = content.section_type

        if ctype == "concept":
            text_parts.append(cjson.get("markdown", ""))
        elif ctype in ("visual", "architecture"):
            if "title" in cjson:
                text_parts.append(cjson["title"])
            if "description" in cjson:
                text_parts.append(cjson["description"])
        elif ctype == "code":
            if "title" in cjson:
                text_parts.append(cjson["title"])
            if "code" in cjson:
                text_parts.append(f"Code:\n{cjson['code']}")
        elif ctype == "math":
            if "title" in cjson:
                text_parts.append(cjson["title"])
            if "description" in cjson:
                text_parts.append(cjson["description"])
        elif ctype == "implementation":
            if "title" in cjson:
                text_parts.append(cjson["title"])
            if "steps" in cjson:
                text_parts.extend(cjson["steps"])
        elif ctype == "reflection":
            if "question" in cjson:
                text_parts.append(cjson["question"])

    topic_text = "\n\n".join(filter(None, text_parts))

    if not topic_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic has no content to generate questions from"
        )

    # Truncate to fit context window
    topic_text = topic_text[:6000]

    # Build prompt
    system_prompt = (
        "You are an expert AI professor specializing in computer science and AI/ML topics. "
        "Generate quiz questions based SOLELY on the provided topic text. "
        "You MUST respond with ONLY a valid JSON object in this exact format:\n"
        '{"questions": [...]}\n\n'
        "Each question in the array must follow one of these formats:\n\n"
        "For MCQ questions:\n"
        "{\n"
        '  "type": "mcq",\n'
        '  "content_json": {"prompt": "question text", "options": ["A", "B", "C", "D"]},\n'
        '  "correct_answer": {"answer": "A"},\n'
        '  "difficulty": 1-10,\n'
        '  "explanation": "why this is the correct answer"\n'
        "}\n\n"
        "For short_answer questions:\n"
        "{\n"
        '  "type": "short_answer",\n'
        '  "content_json": {"prompt": "question text"},\n'
        '  "correct_answer": {"answer": "expected answer text"},\n'
        '  "difficulty": 1-10,\n'
        '  "explanation": "detailed explanation"\n'
        "}\n\n"
        "Do not include any text outside the JSON object."
    )

    user_prompt = (
        f"Based on the following topic content, generate exactly {num_mcq} MCQ questions "
        f"and {num_short_answer} short answer questions.\n\n"
        f"--- TOPIC CONTENT ---\n{topic_text}\n--- END ---\n\n"
        "Return ONLY the JSON object."
    )

    try:
        async with httpx.AsyncClient(timeout=900.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "stream": False,
                    "format": "json",
                },
            )
            response.raise_for_status()
            data = response.json()

            content = data.get("message", {}).get("content", "")
            parsed = json.loads(content)

            questions = parsed.get("questions", [])

            # Validate and normalize the generated questions
            validated = []
            for i, q in enumerate(questions):
                validated.append({
                    "type": q.get("type", "mcq"),
                    "content_json": q.get("content_json", {}),
                    "correct_answer": q.get("correct_answer", ""),
                    "difficulty": q.get("difficulty", 1),
                    "explanation": q.get("explanation"),
                })

            return {
                "topic_id": str(topic_id),
                "generated_questions": validated,
            }

    except httpx.TimeoutException:
        logger.error("Ollama request timed out after 300s for topic %s", topic_id)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI service timed out. The model may be under heavy load. Please try again."
        )
    except httpx.ConnectError:
        logger.error("Cannot connect to Ollama at %s", OLLAMA_BASE_URL)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service (Ollama) is not available. Please ensure Ollama is running."
        )
    except json.JSONDecodeError as e:
        logger.error("Failed to parse Ollama response as JSON: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service returned an invalid response. Please try again."
        )
    except httpx.HTTPStatusError as e:
        logger.error("Ollama HTTP error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {e.response.status_code}"
        )
    except Exception as e:
        logger.error("Unexpected error in quiz generation: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate questions. Please try again."
        )
