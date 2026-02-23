import httpx
import logging
import asyncio
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Base URL for Bhashini API Configuration and Translation
BHASHINI_INFERENCE_URL = settings.BHASHINI_INFERENCE_URL
BHASHINI_CONFIG_URL = settings.BHASHINI_PIPELINE_URL

class BhashiniTranslationClient:
    """
    Client wrapper for the Bhashini Translation API.
    Handles Service ID resolution, batching, and error retry logic.
    Ref: https://uselessai.in/implementing-bhashini-01-model-service-ids-for-asr-tts-translation-31e128f7ba8c
    """
    
    def __init__(self):
        self.user_id = settings.BHASHINI_USER_ID
        self.api_key = settings.BHASHINI_API_KEY
        self.pipeline_id = settings.BHASHINI_PIPELINE_ID
        
        # We cache the resolved service ID for En -> Target Lang
        # to avoid calling the configuration endpoint every time
        self._service_id_cache: Dict[str, str] = {}
        
        self.headers = {
            "Authorization": self.api_key,
            "Content-Type": "application/json"
        }

    async def _resolve_service_id(self, target_lang: str) -> Optional[str]:
        """
        Dynamically fetches the Bhashini Service ID for English -> Target Language.
        """
        if not self.user_id or not self.api_key or not self.pipeline_id:
            logger.warning("Bhashini credentials not fully configured. Translations will fail.")
            return None

        if target_lang in self._service_id_cache:
            return self._service_id_cache[target_lang]

        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": "en",
                            "targetLanguage": target_lang
                        }
                    }
                }
            ],
            "pipelineRequestConfig": {
                "pipelineId": self.pipeline_id
            }
        }

        auth_headers = {
            "userID": self.user_id,
            "ulcaApiKey": self.api_key,
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    BHASHINI_CONFIG_URL,
                    json=payload,
                    headers=auth_headers,
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract the service ID from the config response
                service_id = data["pipelineResponseConfig"][0]["config"][0]["serviceId"]
                
                # Callback URL for actual inference
                self.inference_url = data["pipelineInferenceAPIEndPoint"]["callbackUrl"]
                self.inference_api_key = data["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]["value"]
                self.inference_api_name = data["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]["name"]
                
                self._service_id_cache[target_lang] = service_id
                return service_id
                
        except httpx.HTTPError as e:
            logger.error(f"Failed to resolve Bhashini Service ID for {target_lang}: {str(e)}")
            if hasattr(e, "response") and e.response:
                logger.error(f"Response: {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Failed to resolve Bhashini Service ID for {target_lang}: {str(e)}")
            return None

    async def translate_batch(self, texts: List[str], target_lang: str) -> List[str]:
        """
        Translates an array of text strings from English to the target language.
        Includes basic retry logic.
        """
        service_id = await self._resolve_service_id(target_lang)
        
        if not service_id:
             logger.error(f"Cannot translate: Missing service ID for {target_lang}")
             return texts # Return original english text as fallback

        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": "en",
                            "targetLanguage": target_lang
                        },
                        "serviceId": service_id
                    }
                }
            ],
            "inputData": {
                "input": [{"source": text} for text in texts]
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            self.inference_api_name: self.inference_api_key
        }

        max_retries = 3
        for attempt in range(max_retries):
            try:
                # 30 second timeout as bulk translations can be slow
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        self.inference_url,
                        json=payload,
                        headers=headers,
                        timeout=30.0
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    results = [item["target"] for item in data["pipelineResponse"][0]["output"]]
                    
                    # Ensure we returned exactly the amount we requested, otherwise fail out to fallback
                    if len(results) == len(texts):
                        return results
                    else:
                        logger.error("Bhashini translation count mismatch.")
                        
            except httpx.HTTPError as e:
                 logger.warning(f"Bhashini HTTP Error on attempt {attempt+1}: {str(e)}")
                 await asyncio.sleep(2 ** attempt) # Exponential backoff
            except Exception as e:
                 logger.error(f"Unexpected Bhashini Error on attempt {attempt+1}: {str(e)}")
                 await asyncio.sleep(2 ** attempt)
                 
        logger.error(f"Bhashini translation completely failed after {max_retries} attempts.")
        return texts # Fallback to original language 

    async def _resolve_tts_service_id(self, target_lang: str) -> Optional[str]:
        """
        Dynamically fetches the Bhashini Service ID for Target Language TTS.
        """
        if not self.user_id or not self.api_key or not self.pipeline_id:
            logger.warning("Bhashini credentials not fully configured. TTS will fail.")
            return None

        cache_key = f"tts_{target_lang}"
        if cache_key in self._service_id_cache:
            return self._service_id_cache[cache_key]

        payload = {
            "pipelineTasks": [
                {
                    "taskType": "tts",
                    "config": {
                        "language": {
                            "sourceLanguage": target_lang
                        }
                    }
                }
            ],
            "pipelineRequestConfig": {
                "pipelineId": self.pipeline_id
            }
        }

        auth_headers = {
            "userID": self.user_id,
            "ulcaApiKey": self.api_key,
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    BHASHINI_CONFIG_URL,
                    json=payload,
                    headers=auth_headers,
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract the service ID from the config response
                service_id = data["pipelineResponseConfig"][0]["config"][0]["serviceId"]
                
                # Callback URL for actual inference
                self.inference_url = data["pipelineInferenceAPIEndPoint"]["callbackUrl"]
                self.inference_api_key = data["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]["value"]
                self.inference_api_name = data["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]["name"]
                
                self._service_id_cache[cache_key] = service_id
                return service_id
                
        except httpx.HTTPError as e:
            logger.error(f"Failed to resolve Bhashini TTS Service ID for {target_lang}: {str(e)}")
            if hasattr(e, "response") and e.response:
                logger.error(f"Response: {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Failed to resolve Bhashini TTS Service ID for {target_lang}: {str(e)}")
            return None

    async def generate_tts(self, text: str, target_lang: str, gender: str = "female") -> Optional[str]:
        """
        Generates TTS audio (Base64) for a given text in the target language.
        """
        service_id = await self._resolve_tts_service_id(target_lang)
        
        if not service_id:
             logger.error(f"Cannot generate TTS: Missing service ID for {target_lang}")
             return None

        payload = {
            "pipelineTasks": [
                {
                    "taskType": "tts",
                    "config": {
                        "language": {
                            "sourceLanguage": target_lang
                        },
                        "serviceId": service_id,
                        "gender": gender
                    }
                }
            ],
            "inputData": {
                "input": [{"source": text}]
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            self.inference_api_name: self.inference_api_key
        }

        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        self.inference_url,
                        json=payload,
                        headers=headers,
                        timeout=30.0
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    audio_base64 = data["pipelineResponse"][0]["audio"][0]["audioContent"]
                    return audio_base64
                        
            except httpx.HTTPError as e:
                 logger.warning(f"Bhashini TTS HTTP Error on attempt {attempt+1}: {str(e)}")
                 await asyncio.sleep(2 ** attempt) 
            except KeyError as e:
                 logger.error(f"Bhashini TTS response format error: {str(e)}")
                 return None
            except Exception as e:
                 logger.error(f"Unexpected Bhashini TTS Error on attempt {attempt+1}: {str(e)}")
                 await asyncio.sleep(2 ** attempt)
                 
        logger.error(f"Bhashini TTS completely failed after {max_retries} attempts.")
        return None

bhashini_client = BhashiniTranslationClient()
