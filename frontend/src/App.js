import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUpload from './components/FileUpload';
import QuestionList from './components/QuestionList';
import GeneratedQuestions from './components/GeneratedQuestions';
import RedundantQuestions from './components/RedundantQuestions';
import SearchQuestions from './components/SearchQuestions';
import FilterQuestions from './components/FilterQuestions';
import Statistics from './components/Statistics';
import ExportQuestions from './components/ExportQuestions';
import { questionService } from './services/questionService';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [redundantQuestions, setRedundantQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const result = await questionService.getAllQuestions();
      setQuestions(result.questions || []);
      // Reset filtered questions when loading all questions
      if (!isFiltering) {
        setFilteredQuestions(result.questions || []);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filters) => {
    try {
      setLoading(true);
      setActiveFilters(filters);
      setIsFiltering(Object.keys(filters).length > 0);
      
      if (Object.keys(filters).length === 0) {
        // No filters applied, show all questions
        setFilteredQuestions(questions);
      } else {
        // Apply filters
        const result = await questionService.filterQuestions(filters);
        setFilteredQuestions(result.questions || []);
      }
    } catch (error) {
      console.error('Failed to filter questions:', error);
      toast.error('Failed to filter questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleFileUpload = async (formData) => {
    try {
      setLoading(true);
      const result = await questionService.uploadFileAndGenerateQuestions(formData);
      setGeneratedQuestions(result.questions);
      toast.success(`Generated ${result.questions.length} questions successfully!`);
      setActiveTab('generated');
    } catch (error) {
      toast.error('Failed to generate questions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (questionData) => {
    try {
      const result = await questionService.addQuestion(questionData);
      // Reload all questions to get the latest data from the database
      await loadQuestions();
      // Reapply filters if any are active
      if (isFiltering) {
        await handleFilterChange(activeFilters);
      }
      toast.success('Question added successfully!');
    } catch (error) {
      toast.error('Failed to add question: ' + error.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await questionService.deleteQuestion(questionId);
      // Reload all questions to get the latest data from the database
      await loadQuestions();
      // Reapply filters if any are active
      if (isFiltering) {
        await handleFilterChange(activeFilters);
      }
      toast.success('Question deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete question: ' + error.message);
    }
  };

  const handleUpdateQuestion = async (questionId, updateData) => {
    try {
      await questionService.updateQuestion(questionId, updateData);
      // Reload all questions to get the latest data from the database
      await loadQuestions();
      // Reapply filters if any are active
      if (isFiltering) {
        await handleFilterChange(activeFilters);
      }
      toast.success('Question updated successfully!');
    } catch (error) {
      toast.error('Failed to update question: ' + error.message);
    }
  };

  const handleQuestionSelect = (questionId, isSelected) => {
    setSelectedQuestions(prev => {
      if (isSelected) {
        return [...prev, questionId];
      } else {
        return prev.filter(id => id !== questionId);
      }
    });
  };

  const handleCheckRedundancy = async (threshold = 0.8, n = 2) => {
    try {
      setLoading(true);
      const result = await questionService.checkRedundancy(threshold, n);
      setRedundantQuestions(result.redundant_question_ids);
      toast.info(`Found ${result.redundant_question_ids.length} redundant questions`);
      setActiveTab('redundant');
    } catch (error) {
      toast.error('Failed to check redundancy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Question Bank Management System
        </h1>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload & Generate
          </button>
          <button 
            className={`tab ${activeTab === 'generated' ? 'active' : ''}`}
            onClick={() => setActiveTab('generated')}
          >
            Generated Questions ({generatedQuestions.length})
          </button>
          <button 
            className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            All Questions ({isFiltering ? filteredQuestions.length : questions.length})
          </button>
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search Questions
          </button>
          <button 
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
          <button 
            className={`tab ${activeTab === 'redundant' ? 'active' : ''}`}
            onClick={() => setActiveTab('redundant')}
          >
            Redundant Questions
          </button>
        </div>

        {loading && (
          <div className="loading">
            <p>Loading...</p>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="card">
            <h2>Upload Files & Generate Questions</h2>
            <FileUpload onUpload={handleFileUpload} loading={loading} />
          </div>
        )}

        {activeTab === 'generated' && (
          <div className="card">
            <h2>Generated Questions</h2>
            <GeneratedQuestions 
              questions={generatedQuestions}
              onAddQuestion={handleAddQuestion}
              onClearGenerated={() => setGeneratedQuestions([])}
            />
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>
                All Questions 
                {isFiltering && (
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
                    {' '}(filtered: {filteredQuestions.length} of {questions.length})
                  </span>
                )}
              </h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => loadQuestions()}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button 
                  className="btn btn-warning"
                  onClick={() => handleCheckRedundancy()}
                  disabled={loading}
                >
                  Check Redundancy
                </button>
              </div>
            </div>
            
            <ExportQuestions 
              selectedQuestions={selectedQuestions}
              allQuestionsCount={isFiltering ? filteredQuestions.length : questions.length}
            />
            
            <FilterQuestions 
              onFilterChange={handleFilterChange}
              loading={loading}
            />
            
            <QuestionList 
              questions={isFiltering ? filteredQuestions : questions}
              onDelete={handleDeleteQuestion}
              onUpdate={handleUpdateQuestion}
              selectedQuestions={selectedQuestions}
              onQuestionSelect={handleQuestionSelect}
              showExportActions={true}
            />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="card">
            <h2>Search Questions</h2>
            <SearchQuestions 
              selectedQuestions={selectedQuestions}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="card">
            <Statistics />
          </div>
        )}

        {activeTab === 'redundant' && (
          <div className="card">
            <h2>Redundant Questions</h2>
            <div style={{ marginBottom: '20px' }}>
              <button 
                className="btn btn-warning"
                onClick={() => handleCheckRedundancy()}
              >
                Refresh Redundancy Check
              </button>
            </div>
            <RedundantQuestions 
              redundantQuestions={redundantQuestions}
              onDelete={handleDeleteQuestion}
            />
          </div>
        )}
      </div>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
