import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../services/api';

const CsvUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setMessage(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a .csv file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(response.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <UploadCloud size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Upload CSV Dataset
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
            Upload your fitness membership dataset (e.g. <code>sample_members.csv</code>). Supported columns: <code>Member_ID</code>, <code>Age</code>, <code>Visits_Last_30_Days</code>, <code>Classes_Attended</code>, <code>Days_Since_Last_Visit</code>, <code>Monthly_Spend</code>, <code>Renewed</code>.
          </p>

          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem', color: '#34d399', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <CheckCircle size={18} />
                <span>{message.message}</span>
              </div>
              {message.details && (
                <div style={{ fontSize: '0.775rem', color: '#cbd5e1' }}>
                  Total rows: {message.details.totalProcessed} | Created: {message.details.created} | Updated: {message.details.updated}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div
              style={{
                border: '2px dashed #334155',
                borderRadius: '0.75rem',
                padding: '2rem 1rem',
                textAlign: 'center',
                backgroundColor: '#1e293b',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
              onClick={() => document.getElementById('csvFileInput').click()}
            >
              <input
                id="csvFileInput"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <FileText size={36} color="#818cf8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                {file ? file.name : 'Click or drag & drop CSV file here'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports standard Kalvium .csv files up to 10MB'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary" disabled={uploading}>
                Close
              </button>
              <button type="submit" className="btn-primary" disabled={uploading || !file}>
                <UploadCloud size={16} />
                <span>{uploading ? 'Processing Dataset...' : 'Import Dataset'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CsvUploadModal;
