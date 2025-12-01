import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchMyIssues } from '@/features/issues/issuesSlice';
import api from '@/lib/apiClient';
import { FileText, MapPin, Landmark, AlertCircle, MessageSquare, CheckCircle, XCircle, Paperclip, X, Image, Film, FileUp } from 'lucide-react';
import Toast from '@/components/Toast';
import LocationPicker from '@/components/LocationPicker';
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
  const [geoLocation, setGeoLocation] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]); // Files waiting to be uploaded
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [showToast, setShowToast] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLocationChange = (coords) => {
    setGeoLocation(coords);
    // Auto-fill location field with address or location name, but keep it editable
    if (coords?.address && coords.address.trim() !== '') {
      setForm((prev) => ({ ...prev, location: coords.address }));
    } else if (coords?.locationName && coords.locationName.trim() !== '') {
      // Use location name if available
      setForm((prev) => ({ ...prev, location: coords.locationName }));
    } else if (coords?.latitude && coords?.longitude) {
      // If no address or name, leave empty for user to fill
      // Don't auto-fill with coordinates
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setUploading(true);
    
    try {
      let evidenceUrls = [];
      
      // Upload files if there are any
      if (pendingFiles.length > 0) {
        const formData = new FormData();
        pendingFiles.forEach(file => {
          formData.append('files', file);
        });
        
        const uploadRes = await api.post('/uploads/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        evidenceUrls = uploadRes.data.files.map(f => f.url);
      }
      
      const payload = { ...form, evidenceUrls };
      if (geoLocation?.latitude && geoLocation?.longitude) {
        payload.geoLocation = geoLocation;
      }
      const res = await api.post('/issues', payload);
      setMessage(`Filed complaint: ${res.data.issueId}`);
      // Show success toast
      setShowToast(true);
      setForm({
        issueType: '',
        location: '',
        landmark: '',
        severity: 'medium',
        description: '',
      });
      setGeoLocation(null);
      setPendingFiles([]);
      // Refresh the citizen's complaints list after successful submission
      dispatch(fetchMyIssues());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    // Check maximum 3 files
    if (pendingFiles.length + files.length > 3) {
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
    if (validFiles.length > 0) {
      setPendingFiles([...pendingFiles, ...validFiles]);
      setShowUploadModal(false);
    }
  };

  const removeFile = (index) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== index));
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
    <div className="issue-form-card glass scale-in">
      {/* Evidence Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content evidence-modal scale-in" onClick={(e) => e.stopPropagation()}>
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
                <label className={`file-upload-label ${pendingFiles.length >= 3 ? 'disabled' : ''}`}>
                  <FileUp size={32} />
                  <span>
                    {pendingFiles.length >= 3 
                      ? 'Maximum 3 files reached. Remove files to add new ones.' 
                      : 'Click to select files'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.mp4"
                    onChange={handleFileSelect}
                    disabled={pendingFiles.length >= 3}
                  />
                </label>
              </div>

              {pendingFiles.length > 0 && (
                <div className="selected-files-list">
                  <h4>Attached Files ({pendingFiles.length}/3)</h4>
                  <p className="upload-info">Files will be uploaded when you submit the form</p>
                  {pendingFiles.map((file, index) => (
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
            </div>
            <div className="modal-footer">
              <button 
                className="primary-btn" 
                onClick={() => setShowUploadModal(false)}
              >
                Done
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
        <div className="issue-map-section">
          <LocationPicker
            value={geoLocation}
            onChange={handleLocationChange}
            helperText="Search for the address, drop a pin, or use your current location so field teams can reach faster."
          />
          <p className="issue-map-note">Search results, pinned coordinates, and shared locations are only visible to administrators and department officials.</p>
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
          Attach Evidence {pendingFiles.length > 0 && `(${pendingFiles.length})`}
        </button>
        <button type="submit" className="primary-btn w-full" disabled={uploading}>
          {uploading ? 'Submitting...' : 'Submit Issue'}
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

      {showToast && (
        <Toast 
          message="Submitted Successfully!" 
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default CitizenIssueForm;
