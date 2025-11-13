import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitIssue, uploadEvidence } from '@/features/chat/chatSlice';
import { fetchMyIssues } from '@/features/issues/issuesSlice';
import { FileText, MapPin, Landmark, AlertCircle, MessageSquare, CheckCircle, XCircle, Paperclip, X, Image, Film, FileUp, Loader2 } from 'lucide-react';
import '@/styles/CitizenIssueForm.css';

const CitizenIssueForm = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    issueType: '',
    location: '',
    landmark: '',
    severity: 'medium',
    description: '',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const payload = { ...form, evidenceUrls };
      const res = await dispatch(submitIssue(payload)).unwrap();
      setMessage(`Filed complaint: ${res.issueId}`);
      setForm({
        issueType: '',
        location: '',
        landmark: '',
        severity: 'medium',
        description: '',
      });
      setEvidenceUrls([]);
      setEvidenceFiles([]);
      // Refresh the citizen's complaints list after successful submission
      dispatch(fetchMyIssues());
    } catch (err) {
      setError(err || 'Failed to submit');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    // Check maximum 3 files
    if (selectedFiles.length + files.length > 3) {
      errors.push('You can only attach up to 3 files');
      setUploadErrors(errors);
      return;
    }

    files.forEach(file => {
      // Check file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name} exceeds 50MB limit`);
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} is not a valid file type`);
        return;
      }

      validFiles.push(file);
    });

    setUploadErrors(errors);
    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (index) => {
    setUploadErrors([]);
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      const result = await dispatch(uploadEvidence(selectedFiles)).unwrap();
      const newUrls = result.files.map(f => f.url);
      const newFiles = result.files;
      
      setEvidenceUrls([...evidenceUrls, ...newUrls]);
      setEvidenceFiles([...evidenceFiles, ...newFiles]);
      setSelectedFiles([]);
      setShowUploadModal(false);
      setUploadErrors([]);
    } catch (err) {
      setUploadErrors([err || 'Upload failed. Please try again.']);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image size={20} />;
    if (file.type === 'video/mp4') return <Film size={20} />;
    if (file.type === 'application/pdf') return <FileText size={20} />;
    return <FileUp size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="issue-form-card glass fade-in">
      {/* Evidence Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content evidence-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Attach Evidence</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-info">
                Upload up to 3 files (JPG, PNG, PDF, or MP4). Max 50MB per file.
              </p>
              
              {uploadErrors.length > 0 && (
                <div className="upload-errors">
                  {uploadErrors.map((error, i) => (
                    <p key={i} className="error-text">{error}</p>
                  ))}
                </div>
              )}

              <div className="file-upload-area">
                <label className={`file-upload-label ${(selectedFiles.length + evidenceFiles.length) >= 3 ? 'disabled' : ''}`}>
                  <FileUp size={32} />
                  <span>
                    {(selectedFiles.length + evidenceFiles.length) >= 3 
                      ? 'Maximum 3 files reached. Remove files to add new ones.' 
                      : 'Click to select files'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.mp4"
                    onChange={handleFileSelect}
                    disabled={(selectedFiles.length + evidenceFiles.length) >= 3}
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="selected-files-list">
                  <h4>Selected Files ({selectedFiles.length}/3)</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        {getFileIcon(file)}
                        <div>
                          <p className="file-name">{file.name}</p>
                          <p className="file-size">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button className="remove-file-btn" onClick={() => removeFile(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {evidenceFiles.length > 0 && (
                <div className="uploaded-files-list">
                  <h4>Already Uploaded ({evidenceFiles.length})</h4>
                  {evidenceFiles.map((file, index) => (
                    <div key={index} className="file-item uploaded">
                      <div className="file-info">
                        <FileText size={20} />
                        <div>
                          <p className="file-name">{file.filename}</p>
                        </div>
                      </div>
                      <button className="remove-file-btn" onClick={() => removeUploadedFile(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="ghost-btn" 
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button 
                className="primary-btn" 
                onClick={handleUploadFiles}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${selectedFiles.length} file(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="issue-form-header">
        <div className="issue-form-icon">
          <FileText size={20} />
        </div>
        <div>
          <h3>Quick Issue Form</h3>
          <p className="issue-form-text">
            Prefer forms over chat? Capture the essentials here.
          </p>
        </div>
      </div>
      <form className="issue-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>
            <AlertCircle size={14} />
            Issue type
          </label>
          <input
            name="issueType"
            value={form.issueType}
            onChange={onChange}
            placeholder="Pothole, streetlight, sewage..."
            required
          />
        </div>
        <div className="form-group">
          <label>
            <MapPin size={14} />
            Location
          </label>
          <input
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Area / street / locality"
            required
          />
        </div>
        <div className="form-group">
          <label>
            <Landmark size={14} />
            Landmark (optional)
          </label>
          <input
            name="landmark"
            value={form.landmark}
            onChange={onChange}
            placeholder="Near school, temple, etc."
          />
        </div>
        <div className="form-group">
          <label>
            <AlertCircle size={14} />
            Severity
          </label>
          <select name="severity" value={form.severity} onChange={onChange} className={`severity-select severity-${form.severity}`}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="form-group">
          <label>
            <MessageSquare size={14} />
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Short description of the issue"
            rows={3}
            required
          />
        </div>
        <button 
          type="button"
          className="secondary-btn w-full"
          onClick={() => setShowUploadModal(true)}
        >
          <Paperclip size={16} />
          Attach Evidence {evidenceFiles.length > 0 && `(${evidenceFiles.length})`}
        </button>
        <button type="submit" className="primary-btn w-full">
          Submit Issue
        </button>
      </form>
      {message && (
        <p className="issue-form-message ok">
          <CheckCircle size={16} />
          {message}
        </p>
      )}
      {error && (
        <p className="issue-form-message error">
          <XCircle size={16} />
          {error}
        </p>
      )}
    </div>
  );
};

export default CitizenIssueForm;
