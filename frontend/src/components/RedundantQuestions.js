import React, { useState } from 'react';
import { AlertTriangle, Trash2, Settings } from 'lucide-react';
import { questionService } from '../services/questionService';

const RedundantQuestions = ({ redundantQuestions, onDelete }) => {
  const [threshold, setThreshold] = useState(0.8);
  const [maxResults, setMaxResults] = useState(2);
  const [loading, setLoading] = useState(false);
  const [localRedundantQuestions, setLocalRedundantQuestions] = useState(redundantQuestions || []);
  const [questionDetails, setQuestionDetails] = useState({});

  const handleCheckRedundancy = async () => {
    try {
      setLoading(true);
      const result = await questionService.checkRedundancy(threshold, maxResults);
      setLocalRedundantQuestions(result.redundant_question_ids || []);
      
      // Fetch details for each redundant question
      const details = {};
      for (const questionId of result.redundant_question_ids || []) {
        try {
          const questionDetail = await questionService.getQuestion(questionId);
          if (questionDetail.question) {
            details[questionId] = questionDetail.question;
          }
        } catch (error) {
          console.error(`Failed to fetch question ${questionId}:`, error);
        }
      }
      setQuestionDetails(details);
    } catch (error) {
      alert('Failed to check redundancy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRedundant = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this redundant question?')) {
      try {
        await onDelete(questionId);
        setLocalRedundantQuestions(prev => prev.filter(id => id !== questionId));
        const newDetails = { ...questionDetails };
        delete newDetails[questionId];
        setQuestionDetails(newDetails);
      } catch (error) {
        alert('Failed to delete question: ' + error.message);
      }
    }
  };

  const getDifficultyClass = (difficulty) => {
    const level = (difficulty || 'medium').toLowerCase();
    return `badge-difficulty ${level}`;
  };

  return (
    <div>
      {/* Settings Panel */}
      <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
        <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={20} />
          Redundancy Detection Settings
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Similarity Threshold</label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="form-control"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Current: {threshold} (Higher = more strict)
            </div>
          </div>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Max Results per Group</label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="form-control"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>

        <button
          className="btn btn-warning"
          onClick={handleCheckRedundancy}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check for Redundant Questions'}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="loading">
          <p>Analyzing questions for redundancy...</p>
        </div>
      )}

      {!loading && localRedundantQuestions.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#d4edda',
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <div style={{ color: '#155724', marginBottom: '16px' }}>
            <AlertTriangle size={48} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>No Redundant Questions Found</h3>
          <p style={{ margin: 0, color: '#155724' }}>
            All questions in your database appear to be unique based on the current similarity threshold.
          </p>
        </div>
      )}

      {!loading && localRedundantQuestions.length > 0 && (
        <div>
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffeaa7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={20} style={{ color: '#856404' }} />
              <strong style={{ color: '#856404' }}>
                Found {localRedundantQuestions.length} Potentially Redundant Questions
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
              These questions have high similarity scores and may be duplicates. Review and delete as needed.
            </p>
          </div>

          <div className="redundant-questions">
            {localRedundantQuestions.map((questionId) => {
              const question = questionDetails[questionId];
              
              return (
                <div key={questionId} className="redundant-group">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div className="similarity-score">
                        Question ID: {questionId}
                      </div>
                      {question && (
                        <>
                          <div className="question-meta" style={{ marginBottom: '8px' }}>
                            <span className="badge badge-type">
                              {question.question_type}
                            </span>
                            <span className={`badge ${getDifficultyClass(question.difficulty)}`}>
                              {question.difficulty}
                            </span>
                          </div>
                          
                          <div>
                            <strong>Question:</strong>
                            <p style={{ margin: '4px 0', lineHeight: '1.5' }}>
                              {question.question}
                            </p>
                          </div>
                          
                          {question.solution && (
                            <div style={{ marginTop: '8px' }}>
                              <strong>Solution:</strong>
                              <p style={{ 
                                margin: '4px 0', 
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                fontSize: '14px',
                                lineHeight: '1.4'
                              }}>
                                {question.solution}
                              </p>
                            </div>
                          )}
                          
                          {question.tags && question.tags.length > 0 && (
                            <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {question.tags.map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteRedundant(questionId)}
                      style={{ padding: '6px 12px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {!question && (
                    <div style={{ 
                      padding: '8px', 
                      backgroundColor: '#f8d7da', 
                      borderRadius: '4px',
                      color: '#721c24',
                      fontSize: '14px'
                    }}>
                      Could not load question details. The question may have been deleted.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ 
            marginTop: '20px', 
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#666'
          }}>
            <strong>How redundancy detection works:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Questions are compared using vector similarity in the vector database</li>
              <li>Similarity threshold determines how similar questions need to be to be flagged</li>
              <li>Higher threshold (closer to 1.0) = more strict, only very similar questions flagged</li>
              <li>Lower threshold (closer to 0.5) = less strict, more questions flagged as potentially redundant</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedundantQuestions;
