import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const questionService = {
  // Upload files and generate questions
  uploadFileAndGenerateQuestions: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/upload-file/generate-questions/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Add a question to the database
  addQuestion: async (questionData) => {
    const response = await api.post('/add-question', questionData);
    return response.data;
  },

  // Delete a question
  deleteQuestion: async (questionId) => {
    const response = await api.post('/delete-question', { question_id: questionId });
    return response.data;
  },

  // Get a specific question
  getQuestion: async (questionId) => {
    const response = await api.get(`/get-question/${questionId}`);
    return response.data;
  },

  // Update a question
  updateQuestion: async (questionId, updateData) => {
    const response = await api.post(`/update-question/${questionId}`, updateData);
    return response.data;
  },

  // Get all questions
  getAllQuestions: async (limit = null, offset = 0) => {
    const params = new URLSearchParams();
    if (limit !== null) {
      params.append('limit', limit.toString());
    }
    if (offset > 0) {
      params.append('offset', offset.toString());
    }
    
    const response = await api.get(`/get-all-questions?${params.toString()}`);
    return response.data;
  },

  // Filter questions
  filterQuestions: async (filters = {}, limit = null, offset = 0) => {
    const params = new URLSearchParams();
    
    if (filters.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters.difficulty) {
      params.append('difficulty', filters.difficulty);
    }
    if (filters.language) {
      params.append('language', filters.language);
    }
    if (filters.question_type) {
      params.append('question_type', filters.question_type);
    }
    if (limit !== null) {
      params.append('limit', limit.toString());
    }
    if (offset > 0) {
      params.append('offset', offset.toString());
    }
    
    const response = await api.get(`/filter-questions?${params.toString()}`);
    return response.data;
  },

  // Get filter options
  getFilterOptions: async () => {
    const response = await api.get('/get-filter-options');
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/get-stats');
    return response.data;
  },

  // Export questions
  exportQuestions: async (questionIds = [], format = 'excel', filename = null) => {
    const requestData = {
      question_ids: questionIds,
      format: format,
      filename: filename
    };
    
    const response = await api.post('/export-questions', requestData, {
      responseType: format === 'all' ? 'json' : 'blob'
    });
    
    if (format === 'all') {
      return response.data;
    } else {
      // Handle file download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const defaultFilename = filename || `questions_export_${timestamp}`;
      link.download = `${defaultFilename}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'File downloaded successfully' };
    }
  },

  // Export all questions in specific format
  exportAllQuestions: async (format = 'excel') => {
    const response = await api.get(`/export-questions/${format}`, {
      responseType: 'blob'
    });
    
    // Handle file download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `all_questions_${timestamp}.${format}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'File downloaded successfully' };
  },

  // Search questions
  searchQuestions: async (query, limit = 10) => {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('limit', limit.toString());
    
    const response = await axios.post(`${API_BASE_URL}/search-questions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Check for redundant questions
  checkRedundancy: async (threshold = 0.8, n = 2) => {
    const response = await api.post('/find-redundant-questions', {
      threshold,
      n
    });
    return response.data;
  },
};

export default questionService;
