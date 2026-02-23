import uuid
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from typing import List
import enum

class DifficultyLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class SectionType(str, enum.Enum):
    concept = "concept"
    visual = "visual"
    code = "code"
    architecture = "architecture"
    math = "math"
    implementation = "implementation"
    benchmark = "benchmark"
    reflection = "reflection"

class Topic(Base):
    __tablename__ = "topics"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    module: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    difficulty: Mapped[DifficultyLevel] = mapped_column(Enum(DifficultyLevel), nullable=False)
    order: Mapped[int] = mapped_column(nullable=False)
    is_published: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    contents: Mapped[List["TopicContent"]] = relationship(
        "TopicContent", 
        back_populates="topic",
        cascade="all, delete-orphan",
        order_by="TopicContent.order"
    )


class TopicContent(Base):
    __tablename__ = "topic_contents"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    section_type: Mapped[SectionType] = mapped_column(Enum(SectionType), nullable=False)
    content_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    order: Mapped[int] = mapped_column(nullable=False)
    
    # Relationships
    topic: Mapped["Topic"] = relationship("Topic", back_populates="contents")
