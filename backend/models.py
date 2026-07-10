from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship

from database import Base  # single Base shared with the engine

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    username = Column(String, unique=True, index=True)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    hearts = Column(Integer, default=5)
    last_active = Column(String) # Simple ISO string for streak calculation

class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String) # e.g., "Unit 1: Introduce yourself"
    order = Column(Integer)
    skills = relationship("Skill", back_populates="unit")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"))
    title = Column(String) # e.g., "Basics"
    icon = Column(String)  
    order = Column(Integer)
    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill")

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    order = Column(Integer)
    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson")

class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    type = Column(String) # "multiple_choice", "translate", "match"
    question = Column(String)
    options = Column(JSON) # Store list of options/word bank
    correct_answer = Column(String)
    lesson = relationship("Lesson", back_populates="exercises")

class UserProgress(Base):
    """Tracks which skills are completed vs unlocked"""
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    crowns = Column(Integer, default=0) # Progress rings
    is_completed = Column(Boolean, default=False)