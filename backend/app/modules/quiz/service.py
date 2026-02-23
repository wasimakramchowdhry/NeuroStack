"""
Quiz Service — CRUD operations + quiz engine logic (start, submit, scoring).
"""

from datetime import datetime, timezone
from uuid import UUID
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.modules.quiz.models import Quiz, Question, QuizAttempt, QuestionResponse
from app.modules.quiz.schemas import (
    QuizCreate, QuizUpdate, QuestionCreate,
    QuizSubmit, QuestionResultResponse, QuizResultResponse, QuizAttemptStart,
    QuestionLearnerResponse,
)
from app.modules.quiz.evaluator import evaluate_answer
from app.modules.topics.models import Topic


# ──────────────────────────────────────────────
# Admin: Quiz CRUD
# ──────────────────────────────────────────────

async def create_quiz(db: AsyncSession, quiz_in: QuizCreate) -> Quiz:
    """Create a new empty quiz container linked to a topic."""
    # Verify topic exists
    topic_result = await db.execute(select(Topic).where(Topic.id == quiz_in.topic_id))
    topic = topic_result.scalar_one_or_none()
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    quiz = Quiz(
        topic_id=quiz_in.topic_id,
        title=quiz_in.title,
        difficulty=quiz_in.difficulty.value,
        is_published=quiz_in.is_published,
    )
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    return quiz


async def get_quiz(db: AsyncSession, quiz_id: UUID) -> Quiz:
    """Get a single quiz with its questions."""
    query = select(Quiz).options(selectinload(Quiz.questions)).where(Quiz.id == quiz_id)
    result = await db.execute(query)
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return quiz


async def get_quizzes_by_topic(db: AsyncSession, topic_id: UUID, published_only: bool = True) -> List[Quiz]:
    """Get all quizzes for a topic. Learners only see published; admins see all."""
    query = select(Quiz).where(Quiz.topic_id == topic_id)
    if published_only:
        query = query.where(Quiz.is_published == True)
    query = query.order_by(Quiz.created_at)

    result = await db.execute(query)
    quizzes = result.scalars().all()

    # Attach question count for listing
    for quiz in quizzes:
        count_query = select(func.count(Question.id)).where(Question.quiz_id == quiz.id)
        count_result = await db.execute(count_query)
        setattr(quiz, "question_count", count_result.scalar() or 0)

    return quizzes


async def update_quiz(db: AsyncSession, quiz_id: UUID, quiz_in: QuizUpdate) -> Quiz:
    """Update quiz metadata (title, difficulty, publish status)."""
    query = select(Quiz).where(Quiz.id == quiz_id)
    result = await db.execute(query)
    quiz = result.scalar_one_or_none()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    update_data = quiz_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "difficulty" and value is not None:
            setattr(quiz, field, value.value if hasattr(value, "value") else value)
        else:
            setattr(quiz, field, value)

    await db.commit()
    await db.refresh(quiz)
    return quiz


async def delete_quiz(db: AsyncSession, quiz_id: UUID) -> dict:
    """Delete a quiz and all its questions/attempts (cascade)."""
    query = select(Quiz).where(Quiz.id == quiz_id)
    result = await db.execute(query)
    quiz = result.scalar_one_or_none()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    await db.delete(quiz)
    await db.commit()
    return {"detail": "Quiz deleted successfully"}


# ──────────────────────────────────────────────
# Admin: Question Management
# ──────────────────────────────────────────────

async def set_quiz_questions(
    db: AsyncSession,
    quiz_id: UUID,
    questions_in: List[QuestionCreate],
) -> List[Question]:
    """
    Batch replace all questions in a quiz.
    Deletes existing questions and inserts the new set.
    """
    # Verify quiz exists
    quiz_result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    # Delete existing questions
    await db.execute(delete(Question).where(Question.quiz_id == quiz_id))

    # Insert new questions
    new_questions = []
    for q_in in questions_in:
        question = Question(
            quiz_id=quiz_id,
            type=q_in.type,
            content_json=q_in.content_json,
            correct_answer=q_in.correct_answer if isinstance(q_in.correct_answer, dict) else {"answer": q_in.correct_answer},
            difficulty=q_in.difficulty,
            explanation=q_in.explanation,
            order=q_in.order,
        )
        db.add(question)
        new_questions.append(question)

    await db.commit()
    for q in new_questions:
        await db.refresh(q)

    return new_questions


# ──────────────────────────────────────────────
# Learner: Quiz Engine
# ──────────────────────────────────────────────

async def start_quiz(db: AsyncSession, quiz_id: UUID, user_id: UUID, is_admin: bool = False) -> QuizAttemptStart:
    """
    Start a quiz attempt. Creates a QuizAttempt row and returns questions
    WITHOUT correct_answer or explanation fields.
    Admins can preview unpublished quizzes.
    """
    # Verify quiz exists and is published
    query = select(Quiz).options(selectinload(Quiz.questions)).where(Quiz.id == quiz_id)
    result = await db.execute(query)
    quiz = result.scalar_one_or_none()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    if not quiz.is_published and not is_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This quiz is not yet published")
    if not quiz.questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This quiz has no questions")

    # Create attempt
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz_id,
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)

    # Build learner-safe question list (no answers/explanations)
    questions_out = [
        QuestionLearnerResponse(
            id=q.id,
            quiz_id=q.quiz_id,
            type=q.type,
            content_json=q.content_json,
            difficulty=q.difficulty,
            order=q.order,
        )
        for q in sorted(quiz.questions, key=lambda x: x.order)
    ]

    return QuizAttemptStart(
        attempt_id=attempt.id,
        quiz_title=quiz.title,
        questions=questions_out,
    )


async def submit_quiz(db: AsyncSession, attempt_id: UUID, submission: QuizSubmit, user_id: UUID) -> QuizResultResponse:
    """
    Submit answers for a quiz attempt. Evaluates each answer, creates
    QuestionResponse rows, calculates score, and returns full results.
    """
    # Verify attempt exists and belongs to user
    attempt_query = select(QuizAttempt).where(QuizAttempt.id == attempt_id)
    attempt_result = await db.execute(attempt_query)
    attempt = attempt_result.scalar_one_or_none()

    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")
    if attempt.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This attempt does not belong to you")
    if attempt.completed_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This attempt has already been submitted")

    # Load the quiz and its questions
    quiz_query = select(Quiz).options(selectinload(Quiz.questions)).where(Quiz.id == attempt.quiz_id)
    quiz_result = await db.execute(quiz_query)
    quiz = quiz_result.scalar_one_or_none()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    # Build question lookup
    question_map = {q.id: q for q in quiz.questions}

    # Evaluate each submitted answer
    results: List[QuestionResultResponse] = []
    correct_count = 0

    for answer in submission.answers:
        question = question_map.get(answer.question_id)
        if not question:
            continue  # Skip unknown question IDs

        # Run evaluation
        eval_result = await evaluate_answer(
            question_type=question.type.value,
            user_answer=answer.user_answer,
            correct_answer=question.correct_answer,
            content_json=question.content_json,
        )

        if eval_result.is_correct:
            correct_count += 1

        # Persist the response
        q_response = QuestionResponse(
            attempt_id=attempt_id,
            question_id=question.id,
            user_answer=answer.user_answer if isinstance(answer.user_answer, dict) else {"answer": answer.user_answer},
            is_correct=eval_result.is_correct,
            ai_feedback=eval_result.feedback,
        )
        db.add(q_response)

        results.append(QuestionResultResponse(
            question_id=question.id,
            user_answer=answer.user_answer,
            correct_answer=question.correct_answer,
            is_correct=eval_result.is_correct,
            explanation=question.explanation,
            ai_feedback=eval_result.feedback,
        ))

    # Calculate score
    total_questions = len(quiz.questions)
    score = (correct_count / total_questions * 100) if total_questions > 0 else 0

    # Update attempt
    attempt.score = round(score, 2)
    attempt.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(attempt)

    return QuizResultResponse(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        score=attempt.score,
        total_questions=total_questions,
        correct_count=correct_count,
        started_at=attempt.started_at,
        completed_at=attempt.completed_at,
        results=results,
    )
