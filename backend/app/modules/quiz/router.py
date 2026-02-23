from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_db
from app.modules.auth.models import User
from app.modules.auth.dependencies import get_current_user, get_current_admin_user
from app.modules.quiz import service, schemas
from app.modules.quiz.generator import generate_questions_for_topic

router = APIRouter(prefix="/quiz", tags=["quiz"])


# ──────────────────────────────────────────────
# Admin Endpoints
# ──────────────────────────────────────────────

@router.post("/", response_model=schemas.QuizResponse, status_code=201)
async def create_quiz(
    quiz_in: schemas.QuizCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: Create a new empty quiz container linked to a topic."""
    return await service.create_quiz(db, quiz_in=quiz_in)


@router.get("/{quiz_id}", response_model=schemas.QuizDetailResponse)
async def get_quiz(
    quiz_id: UUID = Path(..., title="Quiz ID"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: Get a quiz with all its questions (including answers)."""
    return await service.get_quiz(db, quiz_id=quiz_id)


@router.put("/{quiz_id}", response_model=schemas.QuizResponse)
async def update_quiz(
    quiz_in: schemas.QuizUpdate,
    quiz_id: UUID = Path(..., title="Quiz ID"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: Update quiz metadata (title, difficulty, publish status)."""
    return await service.update_quiz(db, quiz_id=quiz_id, quiz_in=quiz_in)


@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: UUID = Path(..., title="Quiz ID"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: Delete a quiz and all its questions/attempts."""
    return await service.delete_quiz(db, quiz_id=quiz_id)


@router.post("/{quiz_id}/questions", response_model=List[schemas.QuestionResponse])
async def set_quiz_questions(
    questions_in: List[schemas.QuestionCreate],
    quiz_id: UUID = Path(..., title="Quiz ID"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: Batch replace all questions in a quiz."""
    return await service.set_quiz_questions(db, quiz_id=quiz_id, questions_in=questions_in)


@router.post("/generate/{topic_id}", response_model=schemas.GenerateResponse)
async def generate_quiz_questions(
    topic_id: UUID = Path(..., title="Topic ID"),
    request_body: schemas.GenerateRequest = None,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: Use AI (Ollama) to auto-generate draft questions for a topic."""
    num_mcq = request_body.num_mcq if request_body else 3
    num_short_answer = request_body.num_short_answer if request_body else 1
    return await generate_questions_for_topic(
        db, topic_id=topic_id, num_mcq=num_mcq, num_short_answer=num_short_answer
    )


# ──────────────────────────────────────────────
# Learner Endpoints
# ──────────────────────────────────────────────

@router.get("/topic/{topic_id}", response_model=List[schemas.QuizLearnerListResponse])
async def list_quizzes_for_topic(
    topic_id: UUID = Path(..., title="Topic ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Learner: Fetch all published quizzes for a topic."""
    published_only = current_user.role != "admin"
    return await service.get_quizzes_by_topic(db, topic_id=topic_id, published_only=published_only)


@router.post("/{quiz_id}/start", response_model=schemas.QuizAttemptStart)
async def start_quiz(
    quiz_id: UUID = Path(..., title="Quiz ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Learner: Start a quiz attempt. Returns questions WITHOUT answers."""
    is_admin = current_user.role == "admin"
    return await service.start_quiz(db, quiz_id=quiz_id, user_id=current_user.id, is_admin=is_admin)


@router.post("/attempt/{attempt_id}/submit", response_model=schemas.QuizResultResponse)
async def submit_quiz(
    submission: schemas.QuizSubmit,
    attempt_id: UUID = Path(..., title="Attempt ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Learner: Submit answers for a quiz attempt. Returns scores, correct answers, and AI feedback."""
    return await service.submit_quiz(db, attempt_id=attempt_id, submission=submission, user_id=current_user.id)
