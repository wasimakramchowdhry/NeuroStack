from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict

from app.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.topics.models import Topic
from app.modules.translations.models import UITranslation
from app.tasks.translation_tasks import translate_topic_to_language

router = APIRouter(prefix="/translations", tags=["Translations"])

@router.post("/topic/{topic_id}")
async def force_translate_topic(
    topic_id: str,
    lang: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin endpoint to manually trigger a fresh translation of a Topic.
    Dispatches a Celery worker task in the background.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    # Verify topic exists
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    
    if not topic:
         raise HTTPException(status_code=404, detail="Topic not found")

    # Rather than blocking the HTTP request, throw it to Celery.
    # In a real heavy-prod environment we'd use `.delay()`
    # For now, we'll use FastAPI BackgroundTasks for simpler local dev testing.
    background_tasks.add_task(translate_topic_to_language.delay, str(topic_id), lang)
    
    return {"message": f"Translation task queued for language: {lang}", "status": "processing"}


@router.get("/ui")
async def get_ui_translations(
    lang: str,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, str]:
    """
    Public endpoint for the React frontend (react-i18next) to fetch a dictionary 
    of translated UI strings (e.g. "button.login", "nav.dashboard")
    """
    if lang == "en":
        # English is typically bundled in the frontend, but we can return empty to default
        return {}
        
    result = await db.execute(select(UITranslation).where(UITranslation.language_code == lang))
    translations = result.scalars().all()
    
    # Format into a simple key:value object map for i18next
    i18n_dict = {t.key: t.value for t in translations}
    
    return i18n_dict
