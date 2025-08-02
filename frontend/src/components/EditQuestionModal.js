import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditQuestionModal = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question: question.question || '',
    question_type: question.question_type || 'MCQ',
    solution: question.solution || '',
    difficulty: question.difficulty || 'Medium',
    tags: question.tags || [],
    language: question.language || 'English',
    image_required: question.image_required || false
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out undefined/null values
    const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    onSave(cleanData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Edit Question</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Question *</label>
            <textarea
              name="question"
              className="form-control"
              value={formData.question}
              onChange={handleInputChange}
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Question Type *</label>
            <select
              name="question_type"
              className="form-control"
              value={formData.question_type}
              onChange={handleInputChange}
              required
            >
              <option value="MCQ">MCQ</option>
              <option value="Short Answer">Short Answer</option>
              <option value="Long Answer">Long Answer</option>
              <option value="oneword">One Word</option>
              <option value="True/False">True/False</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Solution</label>
            <textarea
              name="solution"
              className="form-control"
              value={formData.solution}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Difficulty *</label>
            <select
              name="difficulty"
              className="form-control"
              value={formData.difficulty}
              onChange={handleInputChange}
              required
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <input
              type="text"
              name="language"
              className="form-control"
              value={formData.language}
              onChange={handleInputChange}
              placeholder="e.g., English, Hindi, etc."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tag and press Add"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddTag}
              >
                Add Tag
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="tag"
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => removeTag(tag)}
                  >
                    {tag} <X size={12} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="image_required"
                checked={formData.image_required}
                onChange={handleInputChange}
              />
              <span className="form-label" style={{ margin: 0 }}>Image Required</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestionModal;
