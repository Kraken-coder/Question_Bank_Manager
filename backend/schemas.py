from pydantic import BaseModel
from fastapi import UploadFile
from typing import Optional , Literal, List

class QuestionForGeneration(BaseModel):
    """Schema for question generation - no default values for Gemini API compatibility"""
    question: str
    question_type: Literal["MCQ", "Short Answer", "Long Answer" , "oneword", "True/False"]
    solution : str 
    difficulty: Literal["Easy", "Medium", "Hard"]
    tags : list[str]
    language : str
    image_required: bool

class Question(BaseModel):
    question: str
    question_type: Literal["MCQ", "Short Answer", "Long Answer" , "oneword", "True/False"]
    solution : str 
    difficulty: Literal["Easy", "Medium", "Hard"]
    tags : list[str]
    language : Optional[str] = "English"
    image_required: Optional[bool] = False

class QuestionUpdate(BaseModel):
    question: Optional[str] = None
    question_type: Optional[Literal["MCQ", "Short Answer", "Long Answer" , "oneword", "True/False"]] = None
    solution: Optional[str] = None
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None
    tags: Optional[list[str]] = None
    language: Optional[str] = None
    image_required: Optional[bool] = None

class QuestionId(BaseModel):
    question_id : int 
class RedundantQuestion(BaseModel):
    question_id: int
    similarity_score: float
class RedundantDataCheck(BaseModel):
    threshold: float = 0.8
    n: int = 2

class ExportRequest(BaseModel):
    question_ids: List[int] = []
    format: str = "excel"
    filename: Optional[str] = None

class Stats(BaseModel):
    Easy : Optional[int] 
    Medium : Optional[int] 
    Hard : Optional[int] 
    MCQ : Optional[int] 
    Short_answer : Optional[int] 
    Long_answer : Optional[int] 
    oneword : Optional[int] 
    Tf : Optional[int] 
    topics : Optional[list[str]]

