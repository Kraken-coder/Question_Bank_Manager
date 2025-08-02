import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, Package } from 'lucide-react';
import { questionService } from '../services/questionService';
import { toast } from 'react-toastify';

const ExportQuestions = ({ selectedQuestions = [], allQuestionsCount = 0 }) => {
  const [loading, setLoading] = useState(false);

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: <FileSpreadsheet size={16} />, color: '#28a745' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: <FileText size={16} />, color: '#dc3545' },
    { value: 'docx', label: 'Word (.docx)', icon: <File size={16} />, color: '#007bff' },
    { value: 'all', label: 'All Formats', icon: <Package size={16} />, color: '#6f42c1' }
  ];

  const handleSelectedExport = async (format) => {
    if (selectedQuestions.length === 0) {
      toast.warning('Please select questions to export');
      return;
    }

    try {
      setLoading(true);
      await questionService.exportQuestions(selectedQuestions, format);
      toast.success(`${format.toUpperCase()} file with ${selectedQuestions.length} selected question${selectedQuestions.length !== 1 ? 's' : ''} downloaded successfully!`);
    } catch (error) {
      console.error('Selected export error:', error);
      toast.error('Failed to export selected questions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExport = async (format) => {
    try {
      setLoading(true);
      await questionService.exportAllQuestions(format);
      toast.success(`${format.toUpperCase()} file with all questions downloaded successfully!`);
    } catch (error) {
      console.error('Quick export error:', error);
      toast.error('Failed to export: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      backgroundColor: 'white',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Download size={24} color="#007bff" />
        Export Questions
      </h3>

      {/* Selected Questions Export Section or Selection Prompt */}
      {selectedQuestions.length > 0 ? (
        <div style={{ marginBottom: '25px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#e7f3ff',
            border: '1px solid #b3d7ff',
            borderRadius: '6px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={16} color="#0066cc" />
            <span style={{ color: '#0066cc', fontWeight: '500' }}>
              {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected for export
            </span>
          </div>
          
          <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>Export Selected Questions</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {formatOptions.map(option => (
              <button
                key={`selected-${option.value}`}
                onClick={() => handleSelectedExport(option.value)}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 16px',
                  border: `2px solid ${option.color}`,
                  borderRadius: '6px',
                  backgroundColor: option.color,
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.6 : 1,
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', color: '#856404', fontSize: '14px' }}>
            💡 <strong>Tip:</strong> Select questions using the checkboxes in the question list above to export only specific questions.
          </p>
        </div>
      )}

      {/* Quick Export Buttons (All Questions) */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>Export All Questions ({allQuestionsCount} total)</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {formatOptions.filter(opt => opt.value !== 'all').map(option => (
            <button
              key={`all-${option.value}`}
              onClick={() => handleQuickExport(option.value)}
              disabled={loading || allQuestionsCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 16px',
                border: `2px solid ${option.color}`,
                borderRadius: '6px',
                backgroundColor: 'white',
                color: option.color,
                cursor: loading || allQuestionsCount === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
                opacity: loading || allQuestionsCount === 0 ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && allQuestionsCount > 0) {
                  e.target.style.backgroundColor = option.color;
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = option.color;
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportQuestions;
