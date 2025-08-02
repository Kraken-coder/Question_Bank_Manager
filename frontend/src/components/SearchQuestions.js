import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { questionService } from '../services/questionService';
import QuestionList from './QuestionList';

const SearchQuestions = ({ selectedQuestions = [], onQuestionSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [limit, setLimit] = useState(10);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);
      const result = await questionService.searchQuestions(searchQuery.trim(), limit);
      setSearchResults(result.results || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search questions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchPerformed(false);
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div className="search-box">
          <input
            type="text"
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by content, tags, or keywords..."
            style={{ paddingRight: '100px' }}
          />
          <div style={{ 
            position: 'absolute', 
            right: '8px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '4px'
          }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !searchQuery.trim()}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              {loading ? '...' : <Search size={14} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="form-label" style={{ margin: 0, fontSize: '14px' }}>
              Results limit:
            </label>
            <select
              className="form-control"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              style={{ width: 'auto', minWidth: '80px' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {searchPerformed && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearSearch}
              style={{ fontSize: '14px' }}
            >
              Clear Search
            </button>
          )}
        </div>
      </form>

      {loading && (
        <div className="loading">
          <p>Searching questions...</p>
        </div>
      )}

      {searchPerformed && !loading && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <div>
              <strong>Search Results for: "{searchQuery}"</strong>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                Found {searchResults.length} question(s)
              </div>
            </div>
          </div>

          {searchResults.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <p style={{ margin: '0 0 8px 0' }}>No questions found matching your search.</p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Try different keywords or check your spelling.
              </p>
            </div>
          ) : (
            <div>
              {/* Search source breakdown */}
              {searchResults.length > 0 && (
                <div style={{ 
                  marginBottom: '16px', 
                  fontSize: '14px', 
                  color: '#666',
                  display: 'flex',
                  gap: '16px'
                }}>
                  <span>
                    Vector search: {searchResults.filter(q => q.search_source === 'vector').length}
                  </span>
                  <span>
                    Text search: {searchResults.filter(q => q.search_source === 'sql').length}
                  </span>
                </div>
              )}

              <QuestionList 
                questions={searchResults}
                onDelete={() => {
                  // Refresh search after deletion
                  if (searchQuery.trim()) {
                    handleSearch({ preventDefault: () => {} });
                  }
                }}
                onUpdate={() => {
                  // Refresh search after update
                  if (searchQuery.trim()) {
                    handleSearch({ preventDefault: () => {} });
                  }
                }}
                selectedQuestions={selectedQuestions}
                onQuestionSelect={onQuestionSelect}
                showExportActions={true}
              />
            </div>
          )}
        </div>
      )}

      {!searchPerformed && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Search Questions</h3>
          <p style={{ margin: '0 0 16px 0' }}>
            Enter keywords to search through your question database
          </p>
          <div style={{ fontSize: '14px', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <strong>Search features:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Semantic similarity search using vector database</li>
              <li>Text-based keyword matching</li>
              <li>Search in questions, solutions, and tags</li>
              <li>Combined results from multiple search methods</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchQuestions;
