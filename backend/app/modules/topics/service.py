from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.modules.topics.models import Topic, TopicContent
from app.modules.topics.schemas import TopicCreate, TopicUpdate, TopicContentCreate
from app.modules.translations.models import TopicTranslation, TopicContentTranslation, TopicTTSAudio
from app.tasks.translation_tasks import translate_topic_to_language
import copy

async def create_topic(db: AsyncSession, topic_in: TopicCreate) -> Topic:
    topic = Topic(**topic_in.model_dump())
    db.add(topic)
    await db.commit()
    await db.refresh(topic)
    return topic

async def get_topics(
    db: AsyncSession, 
    module: str | None = None, 
    difficulty: str | None = None,
    lang: str = "en",
    is_published: bool | None = True,
    auto_translate: bool = True,
    skip: int = 0, 
    limit: int = 20
) -> List[Topic]:
    query = select(Topic)
    if module:
        query = query.where(Topic.module == module)
    if difficulty:
        query = query.where(Topic.difficulty == difficulty)
    if is_published is not None:
        query = query.where(Topic.is_published == is_published)
    
    query = query.order_by(Topic.module, Topic.order).offset(skip).limit(limit)
    result = await db.execute(query)
    topics = result.scalars().all()
    
    for topic in topics:
        if lang == "en":
            setattr(topic, "is_translated", True)
        else:
            # Check translation cache explicitly for freshness marking
            trans_query = select(TopicTranslation).where(
                TopicTranslation.topic_id == topic.id,
                TopicTranslation.language_code == lang,
                TopicTranslation.is_stale == False
            )
            trans_result = await db.execute(trans_query)
            translation = trans_result.scalar_one_or_none()
            
            if translation:
                topic.title = translation.title
                setattr(topic, "is_translated", True)
            else:
                setattr(topic, "is_translated", False)
                # Cache miss, trigger background task
                if auto_translate:
                    translate_topic_to_language.delay(str(topic.id), lang)

    return topics

async def get_topic_by_slug(db: AsyncSession, slug: str, lang: str = "en") -> Topic:
    query = select(Topic).options(selectinload(Topic.contents)).where(Topic.slug == slug)
    result = await db.execute(query)
    topic = result.scalar_one_or_none()
    
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
        
    if lang != "en":
        # Overwrite Title
        trans_query = select(TopicTranslation).where(
            TopicTranslation.topic_id == topic.id,
            TopicTranslation.language_code == lang,
            TopicTranslation.is_stale == False
        )
        t_result = await db.execute(trans_query)
        translation = t_result.scalar_one_or_none()
        
        if translation:
            topic.title = translation.title
        else:
             translate_topic_to_language.delay(str(topic.id), lang)
             # Add warning flag for frontend
             setattr(topic, "translation_pending", True)

        # Overwrite Content Blocks
        for content in topic.contents:
             ct_query = select(TopicContentTranslation).where(
                 TopicContentTranslation.content_id == content.id,
                 TopicContentTranslation.language_code == lang
             )
             ct_result = await db.execute(ct_query)
             content_translation = ct_result.scalar_one_or_none()
             
             if content_translation:
                 content.content_json = content_translation.translated_json

    return topic

async def update_topic(db: AsyncSession, topic_id: UUID, topic_in: TopicUpdate) -> Topic:
    query = select(Topic).where(Topic.id == topic_id)
    result = await db.execute(query)
    topic = result.scalar_one_or_none()
    
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
        
    update_data = topic_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(topic, field, value)
        
    await db.commit()
    await db.refresh(topic)
    return topic

async def delete_topic(db: AsyncSession, topic_id: UUID) -> dict:
    query = select(Topic).where(Topic.id == topic_id)
    result = await db.execute(query)
    topic = result.scalar_one_or_none()
    
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
        
    await db.delete(topic)
    await db.commit()
    return {"detail": "Topic deleted successfully"}

async def update_topic_contents(db: AsyncSession, topic_id: UUID, contents_in: List[TopicContentCreate]) -> List[TopicContent]:
    # First verify topic exists
    query = select(Topic).where(Topic.id == topic_id)
    result = await db.execute(query)
    topic = result.scalar_one_or_none()
    
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
        
    # Delete all existing contents for this topic
    delete_stmt = delete(TopicContent).where(TopicContent.topic_id == topic_id)
    await db.execute(delete_stmt)
    
    # Add new contents
    new_contents = []
    for content_in in contents_in:
        content = TopicContent(
            topic_id=topic_id,
            section_type=content_in.section_type,
            content_json=content_in.content_json,
            order=content_in.order
        )
        db.add(content)
        new_contents.append(content)
        
    await db.commit()
    
    # Return the newly created contents
    for content in new_contents:
        await db.refresh(content)
        
    return new_contents

async def get_topic_audio(db: AsyncSession, topic_id: UUID, lang: str = "en") -> str:
    # Check cache first
    query = select(TopicTTSAudio).where(
        TopicTTSAudio.topic_id == topic_id,
        TopicTTSAudio.language_code == lang
    )
    result = await db.execute(query)
    cached_audio = result.scalar_one_or_none()
    
    if cached_audio:
        return cached_audio.audio_base64
        
    # Fetch Topic
    topic_query = select(Topic).options(selectinload(Topic.contents)).where(Topic.id == topic_id)
    topic_result = await db.execute(topic_query)
    topic = topic_result.scalar_one_or_none()
    
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
        
    # Apply translation overwrites
    if lang != "en":
        trans_query = select(TopicTranslation).where(
            TopicTranslation.topic_id == topic.id,
            TopicTranslation.language_code == lang,
            TopicTranslation.is_stale == False
        )
        t_result = await db.execute(trans_query)
        translation = t_result.scalar_one_or_none()
        if translation:
            topic.title = translation.title
            
        for content in topic.contents:
             ct_query = select(TopicContentTranslation).where(
                 TopicContentTranslation.content_id == content.id,
                 TopicContentTranslation.language_code == lang
             )
             ct_result = await db.execute(ct_query)
             content_translation = ct_result.scalar_one_or_none()
             if content_translation:
                 content.content_json = content_translation.translated_json
                 
    # Build Text String for TTS
    text_parts = [topic.title + "."]
    
    for content in topic.contents:
        json_data = content.content_json
        ctype = content.section_type
        
        # We only extract narrative-friendly text blocks
        if ctype == "concept":
            text_parts.append(json_data.get("markdown", ""))
        elif ctype == "math":
            if "title" in json_data: text_parts.append(json_data["title"])
            if "description" in json_data: text_parts.append(json_data["description"])
        elif ctype in ["visual", "architecture"]:
            if "title" in json_data: text_parts.append(json_data["title"])
            if "description" in json_data: text_parts.append(json_data["description"])
        elif ctype == "implementation":
            if "title" in json_data: text_parts.append(json_data["title"])
            if "steps" in json_data: 
                text_parts.extend(json_data["steps"])
        elif ctype == "reflection":
            if "question" in json_data: text_parts.append(json_data["question"])
            
    # Clean text (remove heavy markdown syntax)
    full_text = " ".join(filter(None, text_parts)).replace("#", "").replace("*", "")
    
    # Bhashini TTS Client
    from app.modules.translations.bhashini import bhashini_client
    # Limit characters to not override Bhashini processing buffers
    audio_base64 = await bhashini_client.generate_tts(full_text[:3000], target_lang=lang)
    
    if not audio_base64:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to synthesize speech via Bhashini API")
        
    # Cache to database
    new_audio = TopicTTSAudio(
        topic_id=topic.id,
        language_code=lang,
        audio_base64=audio_base64
    )
    db.add(new_audio)
    await db.commit()
    
    return audio_base64

