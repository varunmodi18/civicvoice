import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDepartmentIssues,
  departmentUpdateIssue,
} from '@/features/issues/issuesSlice';
import { Building2, Clock, MapPin, AlertTriangle, Save, MessageSquare, FileText } from 'lucide-react';
import '@/styles/DepartmentHomePage.css';

const DepartmentHomePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { departmentIssues } = useSelector((state) => state.issues);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [resolutionFiles, setResolutionFiles] = useState({});

  useEffect(() => {
    dispatch(fetchDepartmentIssues());
  }, [dispatch]);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, in_review: 0, completed: 0 };
    departmentIssues.forEach((i) => {
      if (i.status === 'pending') counts.pending += 1;
      else if (i.status === 'in_review') counts.in_review += 1;
      else if (i.status === 'completed') counts.completed += 1;
    });
    return counts;
  }, [departmentIssues]);

  const handleCommentChange = (id, value) => {
    setCommentDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (id, value) => {
    setStatusDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (issueId, e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    // Check maximum 3 files
    const currentFiles = resolutionFiles[issueId] || [];
    if (currentFiles.length + files.length > 3) {
      alert('You can only attach up to 3 files');
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
        errors.push(`${file.name} is not a valid file type (allowed: jpg, png, pdf, mp4)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setResolutionFiles((prev) => ({ 
        ...prev, 
        [issueId]: [...(prev[issueId] || []), ...validFiles] 
      }));
    }
  };

  const removeResolutionFile = (issueId, fileIndex) => {
    setResolutionFiles((prev) => ({
      ...prev,
      [issueId]: prev[issueId].filter((_, i) => i !== fileIndex)
    }));
  };

  const handleSubmitUpdate = async (issueId) => {
    const comment = commentDrafts[issueId];
    const status = statusDrafts[issueId];
    const files = resolutionFiles[issueId];
    
    // Find the current issue to check if status actually changed
    const currentIssue = departmentIssues.find(i => i._id === issueId);
    const statusChanged = status && currentIssue && status !== currentIssue.status;

    if (!comment && !statusChanged) {
      alert('Please enter a comment or change the status to submit an update.');
      return;
    }

    try {
      // If there are files and status is being changed to completed, upload them first
      let resolutionEvidence = [];
      if (files && files.length > 0 && status === 'completed') {
        console.log('Uploading files:', files);
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/uploads/multiple`,
          {
            method: 'POST',
            credentials: 'include', // Important: Send cookies with request
            body: formData,
            // Don't set Content-Type header - browser will set it automatically with boundary
          }
        );

        console.log('Upload response status:', uploadRes.status);

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          console.error('Upload error:', errorData);
          throw new Error(errorData.message || 'Failed to upload resolution evidence');
        }

        const uploadData = await uploadRes.json();
        console.log('Upload data:', uploadData);
        resolutionEvidence = uploadData.files ? uploadData.files.map(f => f.url) : [];
      }

      console.log('Submitting update with evidence:', resolutionEvidence);
      
      await dispatch(
        departmentUpdateIssue({
          id: issueId,
          data: { 
            comment: comment || undefined, 
            status: statusChanged ? status : undefined,
            resolutionEvidence: resolutionEvidence.length > 0 ? resolutionEvidence : undefined
          },
        })
      ).unwrap();

      setCommentDrafts((prev) => ({ ...prev, [issueId]: '' }));
      setStatusDrafts((prev) => ({ ...prev, [issueId]: '' }));
      setResolutionFiles((prev) => ({ ...prev, [issueId]: [] }));
      
      alert('Update submitted successfully!');
    } catch (err) {
      console.error('Update error:', err);
      alert(err.message || err.toString() || 'Failed to submit update. Please try again.');
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="department-home">
      <div className="department-card glass slide-up">
        <div className="department-header">
          <div className="department-header-content">
            <div className="department-icon">
              <Building2 size={24} />
            </div>
            <div>
              <h2>{user?.department?.name || 'Department Dashboard'}</h2>
              <p>
                Work through forwarded complaints, update statuses, and leave clear notes
                for admins and citizens.
              </p>
            </div>
          </div>
        </div>

        <div className="status-summary dept-summary">
          <div className="status-pill">
            <AlertTriangle size={16} />
            Pending <span>{statusCounts.pending}</span>
          </div>
          <div className="status-pill">
            <Clock size={16} />
            In Review <span>{statusCounts.in_review}</span>
          </div>
          <div className="status-pill">
            <Save size={16} />
            Completed <span>{statusCounts.completed}</span>
          </div>
        </div>

        <div className="dept-issue-list">
          {departmentIssues.length === 0 && (
            <p className="no-issues">
              <AlertTriangle size={20} />
              No complaints have been forwarded to this department yet.
            </p>
          )}
          {departmentIssues.map((issue) => (
            <div key={issue._id} className="dept-issue-card hover-float">
              <div className="dept-issue-header">
                <div>
                  <h3>{issue.issueType}</h3>
                  <p className="dept-issue-meta">
                    <MapPin size={14} />
                    {issue.location}
                    <span>•</span>
                    <AlertTriangle size={14} />
                    Severity: <strong>{issue.severity}</strong>
                  </p>
                  <p className="dept-issue-meta">
                    <code>CV-{issue._id.slice(-6).toUpperCase()}</code>
                  </p>
                </div>
                <span className={`status-badge status-${issue.status}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <p className="dept-issue-summary">{issue.summary}</p>

              {issue.evidenceUrls && issue.evidenceUrls.length > 0 && (
                <div className="issue-evidence">
                  <h4>
                    <FileText size={14} />
                    Evidence ({issue.evidenceUrls.length})
                  </h4>
                  <div className="evidence-links">
                    {issue.evidenceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="evidence-link"
                      >
                        <FileText size={14} />
                        Evidence {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {issue.departmentUpdates && issue.departmentUpdates.length > 0 && (
                <div className="issue-timeline">
                  <h4>
                    <MessageSquare size={14} />
                    Update Timeline
                  </h4>
                  <ul>
                    {issue.departmentUpdates.map((u, idx) => (
                      <li key={idx}>
                        <span className="timeline-time">
                          {formatDateTime(u.createdAt)}
                        </span>
                        <span className="timeline-text">
                          <span className={`status-badge status-${u.status}`}>
                            {u.status.replace('_', ' ')}
                          </span>
                          {u.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="dept-issue-actions">
                <select
                  value={statusDrafts[issue._id] || issue.status}
                  onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {(statusDrafts[issue._id] === 'completed' || issue.status === 'completed') && (
                <div className="resolution-evidence-upload">
                  <label>
                    <FileText size={16} />
                    Upload Resolution Evidence (Photos/Documents):
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,application/pdf,video/mp4"
                    onChange={(e) => handleFileChange(issue._id, e)}
                  />
                  <p className="file-help-text">
                    Max 3 files • 50MB each • Formats: JPG, PNG, PDF, MP4
                  </p>
                  {resolutionFiles[issue._id] && resolutionFiles[issue._id].length > 0 && (
                    <div className="selected-files-list">
                      {resolutionFiles[issue._id].map((file, idx) => (
                        <div key={idx} className="selected-file-item">
                          <div className="file-info">
                            <FileText size={14} />
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => removeResolutionFile(issue._id, idx)}
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {issue.resolutionEvidence && issue.resolutionEvidence.length > 0 && (
                <div className="issue-evidence resolution-evidence">
                  <h4>
                    <FileText size={14} />
                    Resolution Evidence ({issue.resolutionEvidence.length})
                  </h4>
                  <div className="evidence-links">
                    {issue.resolutionEvidence.map((url, idx) => (
                      <a
                        key={idx}
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="evidence-link"
                      >
                        <FileText size={14} />
                        Resolution {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="dept-comment-box">
                <textarea
                  rows={3}
                  placeholder="Add a brief note about what your team is doing..."
                  value={commentDrafts[issue._id] || ''}
                  onChange={(e) => handleCommentChange(issue._id, e.target.value)}
                />
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleSubmitUpdate(issue._id)}
                >
                  <Save size={16} />
                  Save Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentHomePage;
