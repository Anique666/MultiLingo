"""
schemas.py — Pydantic v2 request/response models.

Each ORM model gets:
  - A *Base* schema (shared fields, no id)
  - A *Create* schema (for POST bodies — same as Base usually)
  - A *Read*  schema (includes id; returned from endpoints)

The SkillTreeNode / UnitTreeResponse composites are used by GET /skills/tree.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, ConfigDict

# ---------------------------------------------------------------------------
# Shared config — enables reading from ORM objects directly
# ---------------------------------------------------------------------------
_orm_config = ConfigDict(from_attributes=True)


# ===========================================================================
# User
# ===========================================================================

class AuthCredentialsBase(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class AuthSignupRequest(AuthCredentialsBase):
    username: str = Field(..., min_length=1, max_length=50)


class AuthLoginRequest(AuthCredentialsBase):
    pass


class AuthCurrentUserResponse(BaseModel):
    model_config = _orm_config

    id: int
    email: Optional[str] = None
    username: str
    xp: int = Field(..., ge=0)
    streak: int = Field(..., ge=0)
    hearts: int = Field(..., ge=0, le=5)
    last_active: Optional[str] = None

class UserBase(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    xp: int = Field(default=0, ge=0)
    streak: int = Field(default=0, ge=0)
    hearts: int = Field(default=5, ge=0, le=5)
    last_active: Optional[str] = None  # ISO 8601 date string, e.g. "2026-07-10"


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    model_config = _orm_config
    id: int


class LeaderboardUserRead(BaseModel):
    model_config = _orm_config

    id: int
    username: str
    xp: int


# ===========================================================================
# Unit
# ===========================================================================

class UnitBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    order: int = Field(..., ge=0)


class UnitCreate(UnitBase):
    pass


class UnitRead(UnitBase):
    model_config = _orm_config
    id: int


# ===========================================================================
# Skill
# ===========================================================================

class SkillBase(BaseModel):
    unit_id: int
    title: str = Field(..., min_length=1, max_length=100)
    icon: str = Field(..., min_length=1, max_length=10)  # emoji or short code
    order: int = Field(..., ge=0)


class SkillCreate(SkillBase):
    pass


class SkillRead(SkillBase):
    model_config = _orm_config
    id: int


# ===========================================================================
# Lesson
# ===========================================================================

class LessonBase(BaseModel):
    skill_id: int
    order: int = Field(..., ge=0)


class LessonCreate(LessonBase):
    pass


class LessonRead(LessonBase):
    model_config = _orm_config
    id: int


# ===========================================================================
# Exercise
# ===========================================================================

class ExerciseBase(BaseModel):
    lesson_id: int
    type: str = Field(
        ...,
        pattern=r"^(multiple_choice|translate|match|fill_blank|arrange_sentence)$",
    )
    question: str = Field(..., min_length=1)
    options: List[str] = Field(
        ...,
        description="Ordered list of answer choices. Must be a JSON array of strings.",
    )
    correct_answer: str = Field(..., min_length=1)

    @field_validator("options", mode="before")
    @classmethod
    def options_must_be_list_of_strings(cls, v: object) -> List[str]:
        """Guard against raw JSON blobs or non-string elements leaking in."""
        if not isinstance(v, list):
            raise ValueError("options must be a list")
        for item in v:
            if not isinstance(item, str):
                raise ValueError(
                    f"Every option must be a string; got {type(item).__name__!r}"
                )
        if len(v) == 0:
            raise ValueError("options must contain at least one choice")
        return v


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseRead(ExerciseBase):
    model_config = _orm_config
    id: int


# ===========================================================================
# UserProgress
# ===========================================================================

class UserProgressBase(BaseModel):
    user_id: int
    skill_id: int
    crowns: int = Field(default=0, ge=0, le=5)
    is_completed: bool = False


class UserProgressCreate(UserProgressBase):
    pass


class UserProgressRead(UserProgressBase):
    model_config = _orm_config
    id: int


# ===========================================================================
# Skill Tree composites (GET /skills/tree/{user_id})
# ===========================================================================

class SkillTreeNode(BaseModel):
    """A skill enriched with the requesting user's progress state."""

    model_config = _orm_config

    id: int
    title: str
    icon: str
    order: int
    # Progress fields (defaults apply when no UserProgress row exists yet)
    crowns: int = 0
    is_completed: bool = False
    is_locked: bool = True  # computed — not stored on DB


class UnitTreeResponse(BaseModel):
    """A unit together with its ordered, progress-enriched skills."""

    model_config = _orm_config

    id: int
    title: str
    order: int
    skills: List[SkillTreeNode]


# ===========================================================================
# Exercise — public read (NEVER exposes correct_answer)
# ===========================================================================

class ExercisePublicRead(BaseModel):
    """Returned when listing exercises before a check — no correct_answer."""

    model_config = _orm_config

    id: int
    lesson_id: int
    type: str
    question: str
    options: List[str]


class LessonExerciseRead(BaseModel):
    """Exercise payload embedded in a lesson; never exposes correct_answer."""

    id: int
    type: str
    question: str
    options: List[str]


class LessonWithExercisesResponse(BaseModel):
    """Lesson payload used by the client lesson loop."""

    id: int
    exercises: List[LessonExerciseRead]


# ===========================================================================
# POST /exercises/{exercise_id}/check
# ===========================================================================

class CheckAnswerRequest(BaseModel):
    answer: str = Field(..., min_length=1)


class CheckAnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    hearts_remaining: int = Field(..., ge=0)
    lesson_failed: bool = False  # True when hearts_remaining == 0


# ===========================================================================
# POST /lessons/{lesson_id}/complete
# ===========================================================================

class LessonCompleteRequest(BaseModel):
    correct_count: int = Field(..., ge=0)
    total_exercises: int = Field(..., ge=1)


class SkillProgressInfo(BaseModel):
    """Snapshot of skill progress after lesson completion."""

    model_config = _orm_config

    skill_id: int
    crowns: int = Field(..., ge=0)
    is_completed: bool


class LessonCompleteResponse(BaseModel):
    xp_awarded: int = Field(..., ge=0)
    total_xp: int = Field(..., ge=0)
    streak: int = Field(..., ge=0)
    skill_progress: SkillProgressInfo
    hearts_remaining: int = Field(..., ge=0)


# ===========================================================================
# GET /users/{user_id}/progress
# ===========================================================================

class UserProgressResponse(BaseModel):
    model_config = _orm_config

    xp: int = Field(..., ge=0)
    streak: int = Field(..., ge=0)
    hearts: int = Field(..., ge=0)
    last_active: Optional[str] = None

