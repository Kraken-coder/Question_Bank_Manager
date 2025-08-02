import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Eye, EyeOff, FileText, Download } from 'lucide-react';
import EditQuestionModal from './EditQuestionModal';

const QuestionList = ({ questions, onDelete, onUpdate, selectedQuestions = [], onQuestionSelect, showExportActions = true }) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showSolutions, setShowSolutions] = useState({});

  const handleQuestionSelect = (questionId, isSelected) => {
    if (onQuestionSelect) {
      onQuestionSelect(questionId, isSelected);
    }
  };

  const isQuestionSelected = (questionId) => {
    return selectedQuestions.includes(questionId);
  };

  const handleSelectAll = () => {
    if (onQuestionSelect) {
      const allSelected = questions.every(q => selectedQuestions.includes(q.question_id));
      if (allSelected) {
        // Deselect all
        questions.forEach(q => onQuestionSelect(q.question_id, false));
      } else {
        // Select all
        questions.forEach(q => {
          if (!selectedQuestions.includes(q.question_id)) {
            onQuestionSelect(q.question_id, true);
          }
        });
      }
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
  };

  const handleSaveEdit = (updatedQuestion) => {
    onUpdate(editingQuestion.question_id, updatedQuestion);
    setEditingQuestion(null);
  };

  const handleDelete = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      onDelete(questionId);
    }
  };

  const toggleSolution = (questionId) => {
    setShowSolutions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getDifficultyClass = (difficulty) => {
    const level = (difficulty || 'medium').toLowerCase();
    return `badge-difficulty ${level}`;
  };

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>No questions in the database yet.</p>
        <p>Generate some questions from uploaded files or add them manually.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ color: '#666' }}>
          Total Questions: {questions.length}
          {showExportActions && selectedQuestions.length > 0 && (
            <span style={{ marginLeft: '16px', color: '#007bff' }}>
              ({selectedQuestions.length} selected for export)
            </span>
          )}
        </div>
        
        {showExportActions && questions.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleSelectAll}
              className="btn btn-outline-primary"
              style={{ fontSize: '14px', padding: '6px 12px' }}
            >
              {questions.every(q => selectedQuestions.includes(q.question_id)) ? 'Deselect All' : 'Select All'}
            </button>
            {selectedQuestions.length > 0 && (
              <span style={{ fontSize: '14px', color: '#666' }}>
                <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Ready for Export
              </span>
            )}
          </div>
        )}
      </div>

      {questions.map((question) => (
        <div key={question.question_id} className="question-item">
          <div className="question-header">
            {showExportActions && (
              <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id={`question-${question.question_id}`}
                  checked={isQuestionSelected(question.question_id)}
                  onChange={(e) => handleQuestionSelect(question.question_id, e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    cursor: 'pointer',
                    marginRight: '8px'
                  }}
                />
                <label 
                  htmlFor={`question-${question.question_id}`} 
                  style={{ 
                    cursor: 'pointer', 
                    fontSize: '12px', 
                    color: '#666',
                    minWidth: '40px',
                    userSelect: 'none'
                  }}
                >
                  Select
                </label>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div className="question-meta">
                <span className="badge badge-type">
                  ID: {question.question_id}
                </span>
                <span className="badge badge-type">
                  {question.question_type}
                </span>
                <span className={`badge ${getDifficultyClass(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                {question.language && question.language !== 'English' && (
                  <span className="badge" style={{ backgroundColor: '#e1f5fe', color: '#0277bd' }}>
                    {question.language}
                  </span>
                )}
                {question.image_required && (
                  <span className="badge" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
                    Image Required
                  </span>
                )}
              </div>
              
              {question.tags && question.tags.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {question.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleEdit(question)}
                style={{ padding: '6px 12px' }}
              >
                <Edit2 size={16} />
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(question.question_id)}
                style={{ padding: '6px 12px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>Question:</strong>
            <p style={{ margin: '4px 0', lineHeight: '1.6' }}>
              {question.question}
            </p>
          </div>

          {question.solution && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong>Solution:</strong>
                <button
                  onClick={() => toggleSolution(question.question_id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: '#007bff',
                    padding: '2px'
                  }}
                >
                  {showSolutions[question.question_id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {showSolutions[question.question_id] && (
                <p style={{ 
                  margin: '4px 0', 
                  padding: '12px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  lineHeight: '1.6',
                  border: '1px solid #e9ecef'
                }}>
                  {question.solution}
                </p>
              )}
            </div>
          )}

          {question.search_source && (
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              fontStyle: 'italic',
              marginTop: '8px'
            }}>
              Source: {question.search_source}
            </div>
          )}
        </div>
      ))}

      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onSave={handleSaveEdit}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
};

export default QuestionList;
