from fastapi import FastAPI , UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from schemas import Question , QuestionId, QuestionUpdate , RedundantQuestion, RedundantDataCheck, ExportRequest
from database_manager import DatabaseManager
from vector_database import VectorDatabase
from pdfexcelgen import PDFExcelGen
from config import DB_CONFIG
import json
import os
import tempfile
from question_generator import QuestionGenerator
from helpers import gemini_ocr
from typing import List, Optional
import psycopg2

app = FastAPI(title="Indian Navy Question Bank API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database and other services
db = None
vd = None
pdf_excel_gen = None

def initialize_services():
    """Initialize services with proper error handling"""
    global db, vd, pdf_excel_gen
    
    # Initialize database
    try:
        db = DatabaseManager()
        print("✓ Database initialized successfully")
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        db = None
    
    # Initialize vector database (optional)
    try:
        vd = VectorDatabase()
        print("✓ Vector database initialized successfully")
    except Exception as e:
        print(f"⚠ Vector database initialization failed (optional): {e}")
        vd = None
    
    # Initialize PDF/Excel generator
    try:
        pdf_excel_gen = PDFExcelGen(output_directory="./exports")
        print("✓ PDF/Excel generator initialized successfully")
    except Exception as e:
        print(f"⚠ PDF/Excel generator initialization failed (optional): {e}")
        pdf_excel_gen = None

# Initialize services on startup
initialize_services()

@app.get("/health")
def health_check():
    """Health check endpoint for Docker and monitoring"""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not initialized")
        
        # Test database connection
        db.cursor.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "config": {
            "db_host": DB_CONFIG['host'],
            "db_port": DB_CONFIG['port'],
            "db_name": DB_CONFIG['dbname']
        }
    }

def check_services():
    """Check if required services are available"""
    if db is None:
        raise HTTPException(status_code=503, detail="Database service not available")

def check_optional_services():
    """Check optional services and return status"""
    return {
        "database": db is not None,
        "vector_database": vd is not None,
        "pdf_generator": pdf_excel_gen is not None
    }

@app.get("/")
def read_root():
    return {"message": "Indian Navy Question Bank API is running", "version": "1.0.0"}

@app.post("/add-question")
def add_question(question_data: Question):
    check_services()
    try:
        question_da = question_data.dict() 
        question_id = db.insert_question(question_da)
        
        # Create a text representation for vector database
        text_for_vector = f"Question: {question_da['question']} Solution: {question_da.get('solution', '')} Tags: {', '.join(question_da.get('tags', []))}"
        
        # Add to vector database if available
        if vd is not None:
            try:
                vd.insert(text=text_for_vector, id=question_id)
            except Exception as ve:
                print(f"Vector database insert failed: {ve}")
                # Continue without vector database if it fails
        else:
            print("Vector database not available, skipping vector insert")
        
        return {"question_id": question_id , "question_data" : question_data}
    except Exception as e:
        print(f"Error adding question: {e}")
        return {"error": f"Failed to add question: {str(e)}"}
@app.post("/delete-question")
def delete_questions(data : QuestionId):
    try:
        question_id = data.question_id
        db.delete_question(question_id)
        
        # Delete from vector database if available
        if vd is not None:
            try:
                vd.delete_id(id=question_id)
            except Exception as ve:
                print(f"Vector database delete failed: {ve}")
                # Continue without vector database if it fails
        else:
            print("Vector database not available, skipping vector delete")
            
        return {"message": f"Question with ID {question_id} deleted successfully."}
    except Exception as e:
        print(f"Error deleting question: {e}")
        return {"error": f"Failed to delete question: {str(e)}"}
@app.get("/get-question/{question_id}")
def get_question(question_id: int):
    question = db.get_question(question_id)
    if question:
        return {"question": question}
    return {"message": f"Question with ID {question_id} not found."}
@app.post("/update-question/{question_id}")
def update_question(question_id: int, update_data: QuestionUpdate):
    try:
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if not update_dict:
            return {"message": "No valid fields provided for update."}
        
        db.update_question(question_id, update_dict)
        
        # Get the full updated question for vector database update
        if vd is not None:
            try:
                updated_question = db.get_question(question_id)
                if updated_question:
                    text_for_vector = f"Question: {updated_question['question']} Solution: {updated_question.get('solution', '')} Tags: {', '.join(updated_question.get('tags', []))}"
                    vd.update_question(id=question_id, text=text_for_vector)
            except Exception as ve:
                print(f"Vector database update failed: {ve}")
                # Continue without vector database if it fails
        else:
            print("Vector database not available, skipping vector update")
        
        return {"message": f"Question with ID {question_id} updated successfully."}
    except Exception as e:
        print(f"Error updating question: {e}")
        return {"error": f"Failed to update question: {str(e)}"}
@app.post("/upload-file/generate-questions/")
def upload_file_generate_questions(
    files: List[UploadFile] = File(...),
    text: Optional[str] = Form(None)
):
    combined_text = ""
    temp_file_paths = []
    
    try:
        # Process each uploaded file
        for file in files:
            # Create a temporary file for each uploaded file
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
                content = file.file.read()
                temp_file.write(content)
                temp_file_path = temp_file.name
                temp_file_paths.append(temp_file_path)
            
            # Extract text using Gemini OCR for each file
            extracted_text = gemini_ocr(temp_file_path)
            combined_text += f"\n--- Content from {file.filename} ---\n{extracted_text}\n"
        
        # Add manual text if provided
        if text:
            combined_text += f"\n--- Manual Text Input ---\n{text}\n"
        
        # If no content was provided at all
        if not combined_text.strip():
            return {"error": "No files or text provided"}
        
        # Pass the combined text to question generator
        question_generator = QuestionGenerator()
        questions = question_generator.generate_questions(table_specification=combined_text.strip())
        questions = json.loads(questions)  # Assuming the output is JSON formatted
        
        return {"questions": questions, "processed_content": combined_text}
    
    finally:
        # Clean up all temporary files
        for temp_file_path in temp_file_paths:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
@app.post("/find-redundant-questions")
def find_redundant_questions(data : RedundantDataCheck):
    """
    Finds redundant questions based on vector similarity.
    Returns a list of question IDs that are considered redundant.
    """
    if vd is None:
        raise HTTPException(
            status_code=503, 
            detail="Vector database service not available. Cannot check for redundant questions."
        )
    
    try:
        redundant_ids = vd.check_redundant_data(threshold=data.threshold, n=data.n)
        return {"redundant_question_ids": redundant_ids}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking redundant questions: {str(e)}"
        )

@app.get("/get-all-questions")
def get_all_questions(limit: Optional[int] = None, offset: int = 0):
    """
    Get all questions from the database.
    
    Args:
        limit: Maximum number of questions to return (None for all)
        offset: Number of questions to skip (for pagination)
    
    Returns:
        List of all questions with their tags
    """
    try:
        if db is None:
            return {
                "total_questions": 0,
                "questions": [],
                "limit": limit,
                "offset": offset,
                "error": "Database service not available"
            }
        
        questions = db.get_all_questions(limit=limit, offset=offset)
        return {
            "total_questions": len(questions),
            "questions": questions,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        print(f"Error getting all questions: {e}")
        return {
            "total_questions": 0,
            "questions": [],
            "limit": limit,
            "offset": offset,
            "error": f"Failed to get questions: {str(e)}"
        }

@app.get("/filter-questions")
def filter_questions(
    tags: Optional[str] = None,
    difficulty: Optional[str] = None,
    language: Optional[str] = None,
    question_type: Optional[str] = None,
    limit: Optional[int] = None,
    offset: int = 0
):
    """
    Filter questions based on various criteria.
    
    Args:
        tags: Comma-separated list of tags to filter by
        difficulty: Difficulty level to filter by
        language: Language to filter by
        question_type: Question type to filter by
        limit: Maximum number of questions to return
        offset: Number of questions to skip (for pagination)
    
    Returns:
        List of filtered questions with their tags
    """
    try:
        # Parse tags if provided
        tag_list = None
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        questions = db.filter_questions(
            tags=tag_list,
            difficulty=difficulty,
            language=language,
            question_type=question_type,
            limit=limit,
            offset=offset
        )
        
        return {
            "total_results": len(questions),
            "questions": questions,
            "filters": {
                "tags": tag_list,
                "difficulty": difficulty,
                "language": language,
                "question_type": question_type
            },
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        print(f"Error filtering questions: {e}")
        return {"error": f"Failed to filter questions: {str(e)}"}

@app.get("/get-filter-options")
def get_filter_options():
    """
    Get all available filter options (unique values for each filterable field).
    
    Returns:
        Dictionary containing unique values for difficulty, language, type, and tags
    """
    try:
        if db is None:
            return {
                "difficulties": [],
                "languages": [],
                "question_types": [],
                "tags": [],
                "error": "Database service not available"
            }
        
        difficulties = db.get_unique_values('difficulty')
        languages = db.get_unique_values('language')
        question_types = db.get_unique_values('type')
        tags = db.get_all_tags()
        
        return {
            "difficulties": difficulties,
            "languages": languages,
            "question_types": question_types,
            "tags": tags
        }
    except Exception as e:
        print(f"Error getting filter options: {e}")
        return {
            "difficulties": [],
            "languages": [],
            "question_types": [],
            "tags": [],
            "error": f"Failed to get filter options: {str(e)}"
        }

@app.get("/get-stats")
def get_statistics():
    """
    Get comprehensive statistics about the question database.
    
    Returns:
        Dictionary containing various statistics about questions
    """
    try:
        stats = db.get_stats()
        return {
            "success": True,
            "statistics": stats
        }
    except Exception as e:
        print(f"Error getting statistics: {e}")
        return {"error": f"Failed to get statistics: {str(e)}"}

@app.post("/export-questions")
def export_questions(export_request: ExportRequest):
    """
    Export questions to PDF, DOCX, or Excel format.
    
    Args:
        export_request: Export request containing question_ids, format, and filename
    
    Returns:
        File download or paths to generated files
    """
    try:
        # Get questions data
        if export_request.question_ids:
            questions_data = db.get_questions(export_request.question_ids)
        else:
            all_questions = db.get_all_questions()
            questions_data = {"questions": all_questions}
        
        if not questions_data.get("questions"):
            return {"error": "No questions found"}
        
        # Check if PDF generator is available
        if pdf_excel_gen is None:
            raise HTTPException(
                status_code=503,
                detail="PDF/Excel generation service not available"
            )
        
        # Generate files based on format
        if export_request.format == "all":
            results = pdf_excel_gen.generate_all_formats(questions_data, export_request.filename)
            return {
                "success": True,
                "message": f"Generated {len(questions_data['questions'])} questions in all formats",
                "files": results,
                "stats": pdf_excel_gen.get_file_stats(questions_data)
            }
        else:
            if export_request.format == "excel":
                filepath = pdf_excel_gen.generate_excel(questions_data, export_request.filename)
            elif export_request.format == "pdf":
                filepath = pdf_excel_gen.generate_pdf(questions_data, export_request.filename)
            elif export_request.format == "docx":
                filepath = pdf_excel_gen.generate_docx(questions_data, export_request.filename)
            else:
                return {"error": "Invalid format. Use 'pdf', 'docx', 'excel', or 'all'"}
            
            # Return file for download
            if os.path.exists(filepath):
                return FileResponse(
                    path=filepath,
                    filename=os.path.basename(filepath),
                    media_type='application/octet-stream'
                )
            else:
                return {"error": "Failed to generate file"}
                
    except Exception as e:
        print(f"Error exporting questions: {e}")
        return {"error": f"Failed to export questions: {str(e)}"}

@app.get("/export-questions/{format}")
def export_all_questions(format: str):
    """
    Export all questions in specified format.
    
    Args:
        format: Export format ('pdf', 'docx', 'excel')
    
    Returns:
        File download
    """
    export_request = ExportRequest(question_ids=[], format=format, filename=None)
    return export_questions(export_request)

@app.post("/search-questions")
def search_questions(query: str = Form(...), limit: int = Form(10)):
    """
    Search questions in both SQL database and vector database.
    Returns combined results without duplicates.
    """
    all_questions = set()
    results = []
    
    
    
    # Search in SQL database for text matches
    try:
        sql_results = db.search_questions(query, limit)
        for question_data in sql_results:
            question_id = question_data['question_id']
            if question_id not in all_questions:
                question_data['search_source'] = 'sql'
                results.append(question_data)
                all_questions.add(question_id)
    except Exception as e:
        print(f"SQL search error: {e}")
    # Search in vector database for semantic similarity
    if vd is not None:
        try:
            vector_results = vd.search(query=query, n_results=limit)
            print(f"Vector search results: {vector_results}")
        
            
            # Get full question data from SQL for vector results
            for question_id in vector_results:
                if question_id not in all_questions:
                    question_data = db.get_question(question_id)
                    print(f"Vector question data: {question_data}")
                    if question_data:
                        question_data['search_source'] = 'vector'
                        results.append(question_data)
                        all_questions.add(question_id)
        except Exception as e:
            print(f"Vector search error: {e}")
    else:
        print("Vector database not available, skipping semantic search")
    
    return {
        "query": query,
        "total_results": len(results),
        "results": results[:limit]  # Limit final results
    }