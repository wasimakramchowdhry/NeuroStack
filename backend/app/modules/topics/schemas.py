from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from uuid import UUID
from app.modules.topics.models import DifficultyLevel, SectionType

# Content Schemas
class TopicContentBase(BaseModel):
    section_type: SectionType
    content_json: Dict[str, Any]
    order: int

class TopicContentCreate(TopicContentBase):
    pass

class TopicContentResponse(TopicContentBase):
    id: UUID
    topic_id: UUID

    model_config = {"from_attributes": True}


# Topic Schemas
class TopicBase(BaseModel):
    title: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255)
    module: str = Field(..., max_length=255)
    difficulty: DifficultyLevel
    order: int
    is_published: bool = False

class TopicCreate(TopicBase):
    pass

class TopicUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    module: Optional[str] = Field(None, max_length=255)
    difficulty: Optional[DifficultyLevel] = None
    order: Optional[int] = None
    is_published: Optional[bool] = None

class TopicResponse(TopicBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    is_translated: Optional[bool] = None

    model_config = {"from_attributes": True}

class TopicDetailResponse(TopicResponse):
    contents: List[TopicContentResponse]
