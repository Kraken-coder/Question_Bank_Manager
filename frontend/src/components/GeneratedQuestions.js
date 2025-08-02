import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const GeneratedQuestions = ({ questions, onAddQuestion, onClearGenerated }) => {
  const [addedQuestions, setAddedQuestions] = useState(new Set());
  const [showSolutions, setShowSolutions] = useState({});

  const handleAddQuestion = async (question, index) => {
    try {
      // Convert the question to the expected format
      const questionData = {
        question: question.question,
        question_type: question.question_type || question.type || 'MCQ',
        solution: question.solution || question.answer || '',
        difficulty: question.difficulty || 'Medium',
        tags: question.tags || [],
        language: question.language || 'English',
        image_required: question.image_required || false
      };

      await onAddQuestion(questionData);
      setAddedQuestions(prev => new Set([...prev, index]));
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const toggleSolution = (index) => {
    setShowSolutions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getDifficultyClass = (difficulty) => {
    const level = (difficulty || 'medium').toLowerCase();
    return `badge-difficulty ${level}`;
  };

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>No questions generated yet.</p>
        <p>Upload some files or text to generate questions.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <p style={{ margin: 0, color: '#666' }}>
          {questions.length} question(s) generated | {addedQuestions.size} added to database
        </p>
        <div>
          <button
            className="btn btn-success"
            onClick={() => {
              questions.forEach((question, index) => {
                if (!addedQuestions.has(index)) {
                  handleAddQuestion(question, index);
                }
              });
            }}
            disabled={addedQuestions.size === questions.length}
          >
            Add All Questions
          </button>
          <button
            className="btn btn-secondary"
            onClick={onClearGenerated}
          >
            Clear Generated
          </button>
        </div>
      </div>

      <div className="generated-questions">
        {questions.map((question, index) => (
          <div key={index} className="generated-question">
            <div style={{ position: 'relative', paddingRight: '120px' }}>
              <div className="question-meta">
                <span className="badge badge-type">
                  {question.question_type || question.type || 'MCQ'}
                </span>
                <span className={`badge ${getDifficultyClass(question.difficulty)}`}>
                  {question.difficulty || 'Medium'}
                </span>
                {question.tags && question.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {question.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Question:</strong>
                <p style={{ margin: '4px 0', lineHeight: '1.5' }}>
                  {question.question}
                </p>
              </div>

              {(question.solution || question.answer) && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong>Solution:</strong>
                    <button
                      onClick={() => toggleSolution(index)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: '#007bff',
                        padding: '2px'
                      }}
                    >
                      {showSolutions[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {showSolutions[index] && (
                    <p style={{ 
                      margin: '4px 0', 
                      padding: '8px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px',
                      lineHeight: '1.5'
                    }}>
                      {question.solution || question.answer}
                    </p>
                  )}
                </div>
              )}

              {question.language && question.language !== 'English' && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>Language:</strong> {question.language}
                </div>
              )}

              <div className="add-question-btn">
                <button
                  className={`btn ${addedQuestions.has(index) ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handleAddQuestion(question, index)}
                  disabled={addedQuestions.has(index)}
                  style={{ minWidth: '100px' }}
                >
                  {addedQuestions.has(index) ? (
                    <>✓ Added</>
                  ) : (
                    <>
                      <Plus size={16} style={{ marginRight: '4px' }} />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length > 5 && (
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button
            className="btn btn-success"
            onClick={() => {
              questions.forEach((question, index) => {
                if (!addedQuestions.has(index)) {
                  handleAddQuestion(question, index);
                }
              });
            }}
            disabled={addedQuestions.size === questions.length}
          >
            Add All Remaining Questions ({questions.length - addedQuestions.size})
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneratedQuestions;
