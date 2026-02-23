import asyncio
from typing import List, Dict, Any
from app.tasks.celery_app import celery_app
from app.modules.translations.bhashini import bhashini_client
from app.database import AsyncSessionLocal
from app.modules.topics.models import Topic, TopicContent, SectionType
from app.modules.translations.models import TopicTranslation, TopicContentTranslation
from sqlalchemy import select

def _is_translatable(section_type: SectionType) -> bool:
    """Only certain section types actually contain translatable text."""
    non_translatable = [SectionType.code, SectionType.math, SectionType.architecture, SectionType.visual, SectionType.benchmark]
    return section_type not in non_translatable

async def _process_translation_async(topic_id: str, target_lang: str):
    """
    Core async payload that powers the Celery synchronous runner.
    """
    async with AsyncSessionLocal() as session:
        # 1. Fetch the master topic
        topic_stmt = select(Topic).where(Topic.id == topic_id)
        topic_result = await session.execute(topic_stmt)
        topic = topic_result.scalar_one_or_none()
        
        if not topic:
            return f"Topic {topic_id} not found."

        # 2. Fetch all components
        content_stmt = select(TopicContent).where(TopicContent.topic_id == topic_id).order_by(TopicContent.order)
        content_result = await session.execute(content_stmt)
        contents = content_result.scalars().all()

        # 3. Extract strings to batch-translate
        # We must align our string array with the objects so we can map them back later
        strings_to_translate = [topic.title]
        translatable_contents = []

        for c in contents:
            if _is_translatable(c.section_type):
                # We assume JSON has a 'markdown' or 'text' key
                text_to_translate = c.content_json.get("markdown", c.content_json.get("text", ""))
                if text_to_translate:
                    strings_to_translate.append(text_to_translate)
                    translatable_contents.append(c)

        # 4. Dispatch to Bhashini
        if not strings_to_translate:
            return "No translatable text found."
            
        translated_strings = await bhashini_client.translate_batch(strings_to_translate, target_lang)
        
        # 5. Map back and Save
        if len(translated_strings) == len(strings_to_translate):
            # Save Topic Title translation
            topic_trans_stmt = select(TopicTranslation).where(
                TopicTranslation.topic_id == topic.id,
                TopicTranslation.language_code == target_lang
            )
            tt_result = await session.execute(topic_trans_stmt)
            topic_translation = tt_result.scalar_one_or_none()
            
            if not topic_translation:
                topic_translation = TopicTranslation(
                    topic_id=topic.id,
                    language_code=target_lang,
                    title=translated_strings[0],
                    is_stale=False
                )
                session.add(topic_translation)
            else:
                topic_translation.title = translated_strings[0]
                topic_translation.is_stale = False
                
            # Save individual blocks
            translated_contents_idx = 1 # 0 was the title
            for tc in translatable_contents:
                content_trans_stmt = select(TopicContentTranslation).where(
                    TopicContentTranslation.content_id == tc.id,
                    TopicContentTranslation.language_code == target_lang
                )
                ct_result = await session.execute(content_trans_stmt)
                content_translation = ct_result.scalar_one_or_none()
                
                new_json = tc.content_json.copy()
                if "markdown" in new_json:
                     new_json["markdown"] = translated_strings[translated_contents_idx]
                elif "text" in new_json:
                     new_json["text"] = translated_strings[translated_contents_idx]

                if not content_translation:
                    content_translation = TopicContentTranslation(
                        content_id=tc.id,
                        language_code=target_lang,
                        translated_json=new_json
                    )
                    session.add(content_translation)
                else:
                    content_translation.translated_json = new_json

                translated_contents_idx += 1
                
            await session.commit()
            return f"Successfully translated and cached Topic {topic_id} to {target_lang}"
        else:
            return "Bhashini failed to return the full payload array."


@celery_app.task
def translate_topic_to_language(topic_id: str, target_lang: str):
    """
    Celery background worker task execution hook.
    """
    # Celery tasks are completely synchronous in python
    # so we must instantiate an event loop for our async DB/HTTP functions
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    result = loop.run_until_complete(_process_translation_async(topic_id, target_lang))
    return result
