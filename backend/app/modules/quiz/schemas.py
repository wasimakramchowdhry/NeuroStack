from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from uuid import UUID
from app.modules.quiz.models import QuestionType
from app.modules.topics.models import DifficultyLevel


# ──────────────────────────────────────────────
# Question Schemas
# ──────────────────────────────────────────────

class QuestionBase(BaseModel):
    type: QuestionType
    content_json: Dict[str, Any]
    correct_answer: Any  # str or dict depending on question type
    difficulty: int = Field(1, ge=1, le=10)
    explanation: Optional[str] = None
    order: int


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    content_json: Optional[Dict[str, Any]] = None
    correct_answer: Optional[Any] = None
    difficulty: Optional[int] = Field(None, ge=1, le=10)
    explanation: Optional[str] = None
    order: Optional[int] = None


class QuestionResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    type: QuestionType
    content_json: Dict[str, Any]
    correct_answer: Any
    difficulty: int
    explanation: Optional[str]
    order: int

    model_config = {"from_attributes": True}


class QuestionLearnerResponse(BaseModel):
    """Question response shown to learners — no correct_answer or explanation."""
    id: UUID
    quiz_id: UUID
    type: QuestionType
    content_json: Dict[str, Any]
    difficulty: int
    order: int

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Quiz Schemas
# ──────────────────────────────────────────────

class QuizBase(BaseModel):
    title: str = Field(..., max_length=255)
    difficulty: DifficultyLevel
    is_published: bool = False


class QuizCreate(QuizBase):
    topic_id: UUID


class QuizUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    difficulty: Optional[DifficultyLevel] = None
    is_published: Optional[bool] = None


class QuizResponse(BaseModel):
    id: UUID
    topic_id: UUID
    title: str
    difficulty: DifficultyLevel
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QuizDetailResponse(QuizResponse):
    questions: List[QuestionResponse]


class QuizLearnerListResponse(BaseModel):
    """Quiz listing for learners — minimal info."""
    id: UUID
    topic_id: UUID
    title: str
    difficulty: DifficultyLevel
    question_count: int = 0

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Quiz Attempt Schemas
# ──────────────────────────────────────────────

class QuizAttemptStart(BaseModel):
    """Response when a learner starts a quiz."""
    attempt_id: UUID
    quiz_title: str
    questions: List[QuestionLearnerResponse]


class AnswerSubmission(BaseModel):
    question_id: UUID
    user_answer: Any  # str or dict depending on question type


class QuizSubmit(BaseModel):
    answers: List[AnswerSubmission]


# ──────────────────────────────────────────────
# Question Response / Result Schemas
# ──────────────────────────────────────────────

class QuestionResultResponse(BaseModel):
    question_id: UUID
    user_answer: Any
    correct_answer: Any
    is_correct: bool
    explanation: Optional[str]
    ai_feedback: Optional[str]

    model_config = {"from_attributes": True}


class QuizResultResponse(BaseModel):
    attempt_id: UUID
    quiz_id: UUID
    quiz_title: str
    score: float
    total_questions: int
    correct_count: int
    started_at: datetime
    completed_at: datetime
    results: List[QuestionResultResponse]


# ──────────────────────────────────────────────
# AI Generator Schemas
# ──────────────────────────────────────────────

class GeneratedQuestion(BaseModel):
    type: QuestionType
    content_json: Dict[str, Any]
    correct_answer: Any
    difficulty: int = 1
    explanation: Optional[str] = None


class GenerateRequest(BaseModel):
    num_mcq: int = Field(3, ge=0, le=10)
    num_short_answer: int = Field(1, ge=0, le=5)


class GenerateResponse(BaseModel):
    topic_id: UUID
    generated_questions: List[GeneratedQuestion]
