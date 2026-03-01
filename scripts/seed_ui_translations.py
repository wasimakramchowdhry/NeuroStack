"""
Seed script to pre-populate Hindi UI translations in the database.
This provides immediate Hindi translations without requiring the Bhashini API.

For other languages, the backend will auto-translate via Bhashini on first request.

Usage:
    cd NeuroStack
    python scripts/seed_ui_translations.py
"""
import asyncio
import os
import sys

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(project_root, "backend")
sys.path.append(backend_dir)
os.chdir(backend_dir)

# When running outside Docker, override postgres host to localhost
if os.environ.get("POSTGRES_SERVER") is None:
    os.environ.setdefault("POSTGRES_SERVER", "localhost")

from app.database import AsyncSessionLocal
from app.modules.translations.models import UITranslation
from sqlalchemy import select, delete


# Hindi translations for all UI keys
HINDI_TRANSLATIONS = {
    # Navbar
    "nav.profile": "प्रोफ़ाइल",
    "nav.logout": "लॉग आउट",
    # Auth pages
    "auth.welcomeBack": "वापस स्वागत है",
    "auth.continueJourney": "अपनी AI सीखने की यात्रा जारी रखें",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.signIn": "साइन इन करें",
    "auth.noAccount": "खाता नहीं है?",
    "auth.createOne": "एक बनाएं",
    "auth.createAccount": "अपना खाता बनाएं",
    "auth.joinNeuroStack": "NeuroStack से जुड़ें और AI सिस्टम में महारत हासिल करें",
    "auth.fullName": "पूरा नाम",
    "auth.confirmPassword": "पासवर्ड की पुष्टि करें",
    "auth.createAccountBtn": "खाता बनाएं",
    "auth.haveAccount": "पहले से खाता है?",
    "auth.signInLink": "साइन इन करें",
    # Dashboard
    "dashboard.welcomeBack": "वापस स्वागत है, {{name}}!",
    "dashboard.readyContinue": "AI सिस्टम की महारत यात्रा जारी रखने के लिए तैयार हैं?",
    "dashboard.topics": "विषय",
    "dashboard.quizzes": "क्विज़",
    "dashboard.badges": "बैज",
    "dashboard.streak": "स्ट्रीक",
    "dashboard.learningPath": "आपका सीखने का मार्ग",
    "dashboard.startLearning": "सीखना शुरू करें",
    "dashboard.exploreTopics": "विषय पुस्तकालय देखें और अपनी यात्रा शुरू करें",
    "dashboard.recentActivity": "हाल की गतिविधि",
    "dashboard.weeklyGoal": "साप्ताहिक लक्ष्य",
    "dashboard.topicsThisWeek": "इस सप्ताह के विषय",
    # Topic list
    "topics.library": "विषय पुस्तकालय",
    "topics.exploreCollection": "AI और ML विषयों का हमारा व्यापक संग्रह देखें",
    "topics.searchPlaceholder": "विषय खोजें...",
    "topics.allDifficulties": "सभी स्तर",
    "topics.beginner": "शुरुआती",
    "topics.intermediate": "मध्यम",
    "topics.advanced": "उन्नत",
    "topics.noTopicsFound": "कोई विषय नहीं मिला",
    "topics.adjustFilters": "अपनी खोज या फ़िल्टर समायोजित करें",
    # Common
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.back": "वापस",
    "common.next": "अगला",
    "common.submit": "जमा करें",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    # Quiz
    "quiz.testKnowledge": "अपना ज्ञान परखें",
    "quiz.startQuiz": "क्विज़ शुरू करें",
    "quiz.question": "प्रश्न",
    "quiz.of": "का",
    "quiz.submitQuiz": "क्विज़ जमा करें",
    "quiz.yourScore": "आपका स्कोर",
    "quiz.retake": "फिर से लें",
    "quiz.backToTopic": "विषय पर वापस जाएं",
}


async def seed_hindi_translations():
    print("=" * 60)
    print("  NeuroStack — Seeding Hindi UI Translations")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        # Check if Hindi translations already exist
        result = await session.execute(
            select(UITranslation).where(UITranslation.language_code == "hi").limit(1)
        )
        existing = result.scalar_one_or_none()

        if existing:
            print("  Hindi translations already exist. Replacing...")
            await session.execute(
                delete(UITranslation).where(UITranslation.language_code == "hi")
            )

        count = 0
        for key, value in HINDI_TRANSLATIONS.items():
            session.add(UITranslation(key=key, language_code="hi", value=value))
            count += 1

        await session.commit()
        print(f"  [+] Seeded {count} Hindi UI translations")

    print()
    print("  Done! Hindi translations are now available.")
    print("  Other languages will be auto-translated via Bhashini on first request.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_hindi_translations())
