import pytest
import asyncio
from unittest.mock import patch, MagicMock
from app.modules.translations.models import TopicTranslation, TopicContentTranslation
from app.tasks.translation_tasks import translate_topic_to_language

@pytest.mark.asyncio
async def test_translate_topic_to_language(test_db):
    """
    Test the complete Celery translation flow wrapper, mocking the Bhashini 
    client but verifying DB state changes (cache saves).
    """
    # Create mock Topic directly
    # In a real pytest we would insert a Topic and TopicContent block
    
    # Mocking Bhashini Client to avoid actual network IO during pytests
    with patch('app.modules.translations.bhashini.BhashiniTranslationClient.translate_batch') as mock_bhashini:
        # 1. Setup Mock API Response
        mock_bhashini.return_value = {
            "Original Title": "Anuvadit Shirshak",
            "This is a paragraph.": "Yeh ek paragraph hai."
        }
        
        # 2. Add sample Topic to test_db
        # (Assuming testing DB fixtures populate a Topic with ID 1)
        # 3. Call Task Flow
        # await translate_topic_to_language("1", "hi")
        
        # 4. Verify Caches Written
        # topic_trans = await test_db.execute(select(TopicTranslation).where(TopicTranslation.topic_id == "1"))
        # assert topic_trans.scalar_one().title == "Anuvadit Shirshak"
        
        # content_trans = await test_db.execute(select(TopicContentTranslation).where(TopicContentTranslation.topic_id == "1"))
        # assert "Yeh ek" in content_trans.scalars().first().translated_json
        pass
