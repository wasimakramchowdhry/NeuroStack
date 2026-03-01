import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict

from app.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.topics.models import Topic
from app.modules.translations.models import UITranslation
from app.modules.translations.bhashini import bhashini_client
from app.tasks.translation_tasks import translate_topic_to_language

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/translations", tags=["Translations"])

# All UI translation keys with their English defaults.
# These are the strings that the frontend wraps with t().
UI_ENGLISH_STRINGS: Dict[str, str] = {
    # Navbar
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    # Auth pages
    "auth.welcomeBack": "Welcome Back",
    "auth.continueJourney": "Continue your AI learning journey",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signIn": "Sign In",
    "auth.noAccount": "Don't have an account?",
    "auth.createOne": "Create one",
    "auth.createAccount": "Create Your Account",
    "auth.joinNeuroStack": "Join NeuroStack and master AI systems",
    "auth.fullName": "Full Name",
    "auth.confirmPassword": "Confirm Password",
    "auth.createAccountBtn": "Create Account",
    "auth.haveAccount": "Already have an account?",
    "auth.signInLink": "Sign in",
    # Dashboard
    "dashboard.welcomeBack": "Welcome back, {{name}}!",
    "dashboard.readyContinue": "Ready to continue your AI Systems mastery journey?",
    "dashboard.topics": "Topics",
    "dashboard.quizzes": "Quizzes",
    "dashboard.badges": "Badges",
    "dashboard.streak": "Streak",
    "dashboard.learningPath": "Your Learning Path",
    "dashboard.startLearning": "Start Learning",
    "dashboard.exploreTopics": "Explore the Topic Library and begin your journey",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.weeklyGoal": "Weekly Goal",
    "dashboard.topicsThisWeek": "Topics this week",
    # Topic list
    "topics.library": "Topic Library",
    "topics.exploreCollection": "Explore our comprehensive collection of AI & ML topics",
    "topics.searchPlaceholder": "Search topics...",
    "topics.allDifficulties": "All Difficulties",
    "topics.beginner": "Beginner",
    "topics.intermediate": "Intermediate",
    "topics.advanced": "Advanced",
    "topics.noTopicsFound": "No topics found",
    "topics.adjustFilters": "Try adjusting your search or filters",
    # Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.back": "Back",
    "common.next": "Next",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    # Quiz
    "quiz.testKnowledge": "Test Your Knowledge",
    "quiz.startQuiz": "Start Quiz",
    "quiz.question": "Question",
    "quiz.of": "of",
    "quiz.submitQuiz": "Submit Quiz",
    "quiz.yourScore": "Your Score",
    "quiz.retake": "Retake Quiz",
    "quiz.backToTopic": "Back to Topic",
}


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

    background_tasks.add_task(translate_topic_to_language.delay, str(topic_id), lang)

    return {"message": f"Translation task queued for language: {lang}", "status": "processing"}


@router.get("/ui")
async def get_ui_translations(
    lang: str,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, str]:
    """
    Public endpoint for the React frontend (react-i18next) to fetch UI translations.

    Flow:
    1. English → return empty dict (defaults are in the frontend code)
    2. Other lang → check DB cache first
    3. If DB is empty → call Bhashini API to translate on-the-fly, then cache in DB
    """
    if lang == "en":
        return {}

    # Check DB cache
    result = await db.execute(select(UITranslation).where(UITranslation.language_code == lang))
    translations = result.scalars().all()

    if translations:
        return {t.key: t.value for t in translations}

    # DB is empty for this language — translate via Bhashini and cache
    logger.info(f"No cached UI translations for '{lang}'. Translating via Bhashini...")

    keys = list(UI_ENGLISH_STRINGS.keys())
    english_texts = list(UI_ENGLISH_STRINGS.values())

    try:
        translated_texts = await bhashini_client.translate_batch(english_texts, lang)
    except Exception as e:
        logger.error(f"Bhashini translation failed for '{lang}': {e}")
        return {}

    # Build the result dict and cache in DB
    i18n_dict: Dict[str, str] = {}
    for key, translated in zip(keys, translated_texts):
        i18n_dict[key] = translated
        db.add(UITranslation(key=key, language_code=lang, value=translated))

    try:
        await db.commit()
        logger.info(f"Cached {len(i18n_dict)} UI translations for '{lang}'")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to cache translations: {e}")

    return i18n_dict
