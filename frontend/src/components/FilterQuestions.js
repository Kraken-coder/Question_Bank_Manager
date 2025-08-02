import React, { useState, useEffect } from 'react';
import { Filter, X, RefreshCw } from 'lucide-react';
import { questionService } from '../services/questionService';

const FilterQuestions = ({ onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    tags: [],
    difficulty: '',
    language: '',
    question_type: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    difficulties: [],
    languages: [],
    question_types: [],
    tags: []
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const options = await questionService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Clean up filters (remove empty values)
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([, v]) => 
        v !== '' && (!Array.isArray(v) || v.length > 0)
      )
    );
    
    onFilterChange(cleanFilters);
  };

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    handleFilterChange('tags', newTags);
  };

  const clearAllFilters = () => {
    setFilters({
      tags: [],
      difficulty: '',
      language: '',
      question_type: ''
    });
    setSelectedTags([]);
    onFilterChange({});
  };

  const hasActiveFilters = () => {
    return filters.difficulty || filters.language || filters.question_type || selectedTags.length > 0;
  };

  const filteredTags = filterOptions.tags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  return (
    <div className="filter-container" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <button
          className={`btn ${isExpanded ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Filter size={16} />
          Filters {hasActiveFilters() && `(${Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length})`}
        </button>
        
        {hasActiveFilters() && (
          <button
            className="btn btn-outline"
            onClick={clearAllFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
        
        <button
          className="btn btn-outline"
          onClick={loadFilterOptions}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <RefreshCw size={16} />
          Refresh Options
        </button>
      </div>

      {isExpanded && (
        <div className="filter-panel" style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {/* Difficulty Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value="">All Difficulties</option>
                {filterOptions.difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value="">All Languages</option>
                {filterOptions.languages.map(language => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Type Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Question Type
              </label>
              <select
                value={filters.question_type}
                onChange={(e) => handleFilterChange('question_type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value="">All Types</option>
                {filterOptions.question_types.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tags ({selectedTags.length} selected)
            </label>
            
            <input
              type="text"
              placeholder="Search tags..."
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '10px'
              }}
            />

            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px',
              backgroundColor: 'white'
            }}>
              {filteredTags.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No tags found</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {filteredTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        padding: '4px 8px',
                        border: selectedTags.includes(tag) ? '2px solid #007bff' : '1px solid #ccc',
                        borderRadius: '15px',
                        backgroundColor: selectedTags.includes(tag) ? '#007bff' : 'white',
                        color: selectedTags.includes(tag) ? 'white' : '#333',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong>Selected Tags:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      {tag}
                      <X
                        size={12}
                        onClick={() => handleTagToggle(tag)}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterQuestions;
