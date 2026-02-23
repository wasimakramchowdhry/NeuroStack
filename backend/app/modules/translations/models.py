import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class TopicTranslation(Base):
    """
    Caches the translated title of a Topic.
    If the base English Topic is updated, `is_stale` is flagged True.
    """
    __tablename__ = "topic_translations"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    language_code: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    is_stale: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    

class TopicContentTranslation(Base):
    """
    Caches the translated text blocks (json) for a specific TopicContent section.
    """
    __tablename__ = "topic_content_translations"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("topic_contents.id", ondelete="CASCADE"), nullable=False, index=True)
    language_code: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    translated_json: Mapped[dict] = mapped_column(JSONB, nullable=False)


class UITranslation(Base):
    """
    Dictionary for static UI string elements (e.g. 'button.login') that the React frontend fetches.
    """
    __tablename__ = "ui_translations"
    
    key: Mapped[str] = mapped_column(String(255), primary_key=True)
    language_code: Mapped[str] = mapped_column(String(10), primary_key=True)
    value: Mapped[str] = mapped_column(String, nullable=False)


class TopicTTSAudio(Base):
    """
    Caches the generated speech (Base64 string) for an entire topic in a specific language.
    """
    __tablename__ = "topic_tts_audio"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    language_code: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    audio_base64: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
