from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_db
from app.modules.auth.models import User
from app.modules.auth.dependencies import get_current_user, get_current_admin_user
from app.modules.topics import service, schemas

router = APIRouter(prefix="/topics", tags=["topics"])


# Public / Learner Endpoints
@router.get("/", response_model=List[schemas.TopicResponse])
async def read_topics(
    db: AsyncSession = Depends(get_db),
    module: str | None = Query(None, description="Filter by module name"),
    lang: str = Query("en", description="Target translation language code (e.g. 'hi')"),
    auto_translate: bool = Query(True, description="Whether to trigger background translation on cache miss"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all published topics. Supports filtering by module and difficulty, with pagination.
    """
    # Only admins can see unpublished topics via the list endpoint
    is_published = None if current_user.role == "admin" else True
    return await service.get_topics(
        db, 
        module=module, 
        lang=lang,
        is_published=is_published,
        auto_translate=auto_translate,
        skip=skip, 
        limit=limit
    )


@router.get("/{slug}", response_model=schemas.TopicDetailResponse)
async def read_topic_by_slug(
    slug: str = Path(..., title="The slug of the topic"),
    lang: str = Query("en", description="Target translation language code"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve specific topic metadata + all its content sections ordered correctly.
    Applies translation overrides if available.
    """
    return await service.get_topic_by_slug(db, slug=slug, lang=lang)


@router.get("/{topic_id}/audio", response_model=str)
async def read_topic_audio(
    topic_id: UUID = Path(..., title="The ID of the topic"),
    lang: str = Query("hi", description="Target translation language code"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the base64-encoded TTS audio payload for a specific topic in the target language.
    Dynamically generates via Bhashini API or fetches from PostgreSQL cache.
    """
    return await service.get_topic_audio(db, topic_id=topic_id, lang=lang)


# Admin-Only Endpoints
@router.post("/", response_model=schemas.TopicResponse, status_code=201)
async def create_topic(
    topic_in: schemas.TopicCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Admin: Create a new topic
    """
    return await service.create_topic(db, topic_in=topic_in)


@router.put("/{topic_id}", response_model=schemas.TopicResponse)
async def update_topic(
    topic_id: UUID,
    topic_in: schemas.TopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Admin: Update topic metadata (title, slug, difficulty, etc.)
    """
    return await service.update_topic(db, topic_id=topic_id, topic_in=topic_in)


@router.delete("/{topic_id}")
async def delete_topic(
    topic_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Admin: Delete a topic and all of its content.
    """
    return await service.delete_topic(db, topic_id=topic_id)


@router.post("/{topic_id}/content", response_model=List[schemas.TopicContentResponse])
async def update_topic_contents(
    topic_id: UUID,
    contents_in: List[schemas.TopicContentCreate],
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Admin: Update/Replace the entire content flow for a single topic.
    Receives an ordered list of TopicContent items.
    """
    return await service.update_topic_contents(db, topic_id=topic_id, contents_in=contents_in)
