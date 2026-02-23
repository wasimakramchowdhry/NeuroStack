import asyncio
from app.config import settings
from app.modules.translations.bhashini import bhashini_client
import sys

async def main():
    print(f"Loaded User ID from env: {bool(settings.BHASHINI_USER_ID)}")
    print(f"Loaded API Key from env: {bool(settings.BHASHINI_API_KEY)}")
    print(f"Loaded Pipeline from env: {bool(settings.BHASHINI_PIPELINE_ID)}")
    
    print("\nAttempting to resolve service ID for English -> Hindi...")
    service_id = await bhashini_client._resolve_service_id("hi")
    print(f"Resolved Service ID: {service_id}")
    
    if not service_id:
        print("Failed to resolve service ID.")
        sys.exit(1)
        
    print("\nAttempting translation...")
    text = ["Hello world, this is a test string from the NeuroStack engine."]
    result = await bhashini_client.translate_batch(text, "hi")
    
    print(f"\nOriginal: {text}")
    print(f"Translation Output: {result}")

if __name__ == "__main__":
    asyncio.run(main())
