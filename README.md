# Question Bank Management System

A comprehensive web application for managing educational questions with AI-powered generation, redundancy detection, and advanced search capabilities.

## Features

### 🚀 Core Functionality
- **File Upload & Question Generation**: Upload PDF files and/or text to automatically generate questions using AI
- **Question Management**: Add, edit, delete, and view questions in a user-friendly interface
- **Advanced Search**: Semantic search using vector database + text-based keyword search
- **Redundancy Detection**: Identify and manage duplicate or similar questions
- **Question Types**: Support for MCQ, Short Answer, Long Answer, One Word, and True/False questions

### 🎯 Key Features
- **Batch Operations**: Add all generated questions at once or selectively
- **Real-time Feedback**: Toast notifications for all operations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Persistence**: Questions stored in both SQL database and vector database
- **Solution Management**: Toggle visibility of solutions for better question review

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLite**: Lightweight database for question storage
- **ChromaDB**: Vector database for semantic search and redundancy detection
- **Gemini AI**: OCR and question generation capabilities

### Frontend
- **React 18**: Modern UI library with hooks
- **Axios**: HTTP client for API communication
- **React Toastify**: Beautiful notifications
- **Lucide React**: Modern icon library
- **CSS3**: Custom styling with responsive design

## Project Structure

```
indianNavy/
├── backend/
│   ├── backend_server.py      # FastAPI server and endpoints
│   ├── config.py              # Configuration settings
│   ├── database_manager.py    # SQL database operations
│   ├── vector_database.py     # Vector database operations
│   ├── question_generator.py  # AI question generation
│   ├── helpers.py             # Utility functions (OCR, etc.)
│   ├── schemas.py             # Pydantic models
│   └── VectorDataBase/        # ChromaDB storage
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API service layer
│   │   ├── App.js             # Main application component
│   │   └── index.js           # Application entry point
│   ├── public/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   # or
   source .venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install fastapi uvicorn python-multipart
   pip install chromadb sqlite3 pydantic
   pip install google-generativeai  # For Gemini AI
   # Add other dependencies as needed
   ```

4. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_NAME=question_bank
   ```

5. **Start the backend server**
   ```bash
   uvicorn backend_server:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000` and will proxy API requests to the backend at `http://localhost:8000`.

## Usage Guide

### 1. Upload & Generate Questions
- Navigate to the "Upload & Generate" tab
- Upload PDF files by dragging and dropping or clicking to browse
- Optionally add manual text input
- Click "Generate Questions" to create questions using AI
- Review generated questions in the "Generated Questions" tab

### 2. Manage Generated Questions
- View all generated questions with their metadata
- Click "Add" button to add individual questions to the database
- Use "Add All Questions" to add all generated questions at once
- Toggle solution visibility using the eye icon

### 3. View & Edit Questions
- Go to "All Questions" tab to see questions in the database
- Edit questions using the edit button (pencil icon)
- Delete questions using the delete button (trash icon)
- View question metadata including type, difficulty, tags, and language

### 4. Search Questions
- Use the "Search Questions" tab for advanced searching
- Search supports both semantic similarity and keyword matching
- Adjust result limits as needed
- Results show both vector and SQL search sources

### 5. Detect Redundancy
- Click "Check Redundancy" button in the questions view or redundant tab
- Adjust similarity threshold (0.5-1.0) for detection sensitivity
- Review flagged redundant questions
- Delete redundant questions as needed

## API Endpoints

### Question Management
- `POST /add-question` - Add a new question
- `GET /get-question/{question_id}` - Get specific question
- `POST /update-question/{question_id}` - Update question
- `POST /delete-question` - Delete question

### File Processing
- `POST /upload-file/generate-questions/` - Upload files and generate questions

### Search & Analysis
- `POST /search-questions` - Search questions
- `POST /find-redundant-questions` - Find redundant questions

## Development Notes

### Adding New Question Types
1. Update `schemas.py` to include new question type in the Literal type
2. Update frontend components to handle the new type
3. Ensure question generation logic supports the new type

### Customizing UI
- Modify `src/index.css` for global styles
- Update component-specific styles in individual component files
- Colors and theming can be adjusted in the CSS variables

### Environment Configuration
- Backend API URL can be configured via `REACT_APP_API_URL` environment variable
- Default proxy is set up in `package.json` for development

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS middleware is properly configured in backend
   - Check that frontend is making requests to correct backend URL

2. **File Upload Issues**
   - Verify file size limits
   - Check that multipart/form-data is properly handled
   - Ensure temporary file cleanup is working

3. **Database Connection Issues**
   - Check SQLite database file permissions
   - Verify ChromaDB is properly initialized
   - Ensure database paths are correct

4. **Search Not Working**
   - Verify vector database has been populated with questions
   - Check that embeddings are being generated properly
   - Ensure search endpoints are properly configured

### Performance Optimization
- For large question databases, consider implementing pagination
- Add database indexing for frequently searched fields
- Implement caching for frequently accessed questions
- Consider using background tasks for heavy operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
