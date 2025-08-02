import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const FileUpload = ({ onUpload, loading }) => {
  const [files, setFiles] = useState([]);
  const [manualText, setManualText] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (files.length === 0 && !manualText.trim()) {
      alert('Please upload at least one file or enter some text');
      return;
    }

    const formData = new FormData();
    
    // Add files to FormData
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add manual text if provided
    if (manualText.trim()) {
      formData.append('text', manualText.trim());
    }

    onUpload(formData);
  };

  const clearAll = () => {
    setFiles([]);
    setManualText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* File Upload Area */}
      <div className="form-group">
        <label className="form-label">Upload PDF Files</label>
        <div
          className={`file-upload ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <Upload size={48} style={{ color: '#666', marginBottom: '16px' }} />
          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>
            Drop files here or click to browse
          </p>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            Supports PDF files
          </p>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Selected Files Display */}
      {files.length > 0 && (
        <div className="form-group">
          <label className="form-label">Selected Files ({files.length})</label>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '12px' }}>
            {files.map((file, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: index < files.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FileText size={16} style={{ marginRight: '8px', color: '#666' }} />
                  <span style={{ fontSize: '14px' }}>{file.name}</span>
                  <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: '#dc3545',
                    padding: '4px'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Text Input */}
      <div className="form-group">
        <label className="form-label">Additional Text (Optional)</label>
        <textarea
          className="form-control"
          rows="6"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Enter any additional text content to generate questions from..."
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || (files.length === 0 && !manualText.trim())}
        >
          {loading ? 'Generating Questions...' : 'Generate Questions'}
        </button>
        
        {(files.length > 0 || manualText.trim()) && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearAll}
            disabled={loading}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
          Instructions:
        </h4>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Upload one or more PDF files to extract text content</li>
          <li>Optionally add manual text input for additional context</li>
          <li>The system will process all content and generate relevant questions</li>
          <li>Generated questions can be reviewed and added to the question bank</li>
        </ul>
      </div>
    </form>
  );
};

export default FileUpload;
