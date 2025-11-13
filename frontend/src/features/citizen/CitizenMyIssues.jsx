import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyIssues, reopenIssue } from '@/features/issues/issuesSlice';
import { FileText, MapPin, Building2, Clock, AlertCircle, RotateCcw, Image as ImageIcon } from 'lucide-react';
import '@/styles/CitizenMyIssues.css';

const CitizenMyIssues = () => {
  const dispatch = useDispatch();
  const { myIssues } = useSelector((state) => state.issues);
  const [reopenComments, setReopenComments] = useState({});
  const [showReopenForm, setShowReopenForm] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    dispatch(fetchMyIssues());
  }, [dispatch]);

  const handleReopenToggle = (issueId) => {
    setShowReopenForm((prev) => ({ ...prev, [issueId]: !prev[issueId] }));
  };

  const handleReopenCommentChange = (issueId, value) => {
    setReopenComments((prev) => ({ ...prev, [issueId]: value }));
  };

  const handleReopenSubmit = async (issueId) => {
    const comment = reopenComments[issueId];
    if (!comment || comment.trim() === '') {
      alert('Please provide a reason for reopening this issue.');
      return;
    }

    try {
      await dispatch(reopenIssue({ id: issueId, comment })).unwrap();
      setReopenComments((prev) => ({ ...prev, [issueId]: '' }));
      setShowReopenForm((prev) => ({ ...prev, [issueId]: false }));
      dispatch(fetchMyIssues());
    } catch (err) {
      alert(err || 'Failed to reopen issue.');
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
    <div className="citizen-myissues-card glass slide-up">
      <div className="citizen-myissues-header">
        <div className="citizen-myissues-icon">
          <FileText size={20} />
        </div>
        <div>
          <h3>My Complaints</h3>
          <p className="citizen-myissues-text">
            Track statuses and see department updates
          </p>
        </div>
      </div>
      <div className="citizen-myissues-list">
        {myIssues.length === 0 && (
          <div className="citizen-myissues-empty">
            <AlertCircle size={24} />
            <p>No complaints yet. Use the chat or quick form to submit one.</p>
          </div>
        )}
        {myIssues.map((issue) => (
          <div key={issue._id} className="citizen-myissues-row hover-float">
            <div className="citizen-myissues-row-header">
              <span className="citizen-myissues-type">{issue.issueType}</span>
              <span className={`status-badge status-${issue.status}`}>
                {issue.status.replace('_', ' ')}
              </span>
            </div>
            <p className="citizen-myissues-meta">
              <Clock size={12} />
              <code>CV-{issue._id.slice(-6).toUpperCase()}</code>
              <span>•</span>
              {formatDateTime(issue.createdAt)}
            </p>
            <p className="citizen-myissues-location">
              <MapPin size={14} />
              <strong>{issue.location}</strong>
            </p>
            {issue.forwardedTo && (
              <p className="citizen-myissues-location">
                <Building2 size={14} />
                <strong>{issue.forwardedTo.name}</strong>
              </p>
            )}
            <p className="citizen-myissues-summary">{issue.summary}</p>

            {issue.resolutionEvidence && issue.resolutionEvidence.length > 0 && (
              <div className="resolution-evidence-section">
                <h4>
                  <ImageIcon size={14} />
                  Resolution Evidence
                </h4>
                <div className="resolution-evidence-grid">
                  {issue.resolutionEvidence.map((url, idx) => (
                    <div
                      key={idx}
                      className="resolution-evidence-item"
                      onClick={() => setSelectedImage(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${url}`)}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${url}`}
                        alt={`Resolution ${idx + 1}`}
                      />
                      <span className="evidence-overlay">
                        <ImageIcon size={16} />
                        View
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {issue.departmentUpdates && issue.departmentUpdates.length > 0 && (
              <div className="citizen-myissues-timeline">
                <h4>Department Updates</h4>
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

            {issue.status === 'completed' && (
              <div className="reopen-section">
                {!showReopenForm[issue._id] ? (
                  <button
                    className="reopen-btn"
                    onClick={() => handleReopenToggle(issue._id)}
                  >
                    <RotateCcw size={16} />
                    Not Satisfied? Reopen Issue
                  </button>
                ) : (
                  <div className="reopen-form">
                    <textarea
                      rows={3}
                      placeholder="Please explain why you're reopening this issue..."
                      value={reopenComments[issue._id] || ''}
                      onChange={(e) => handleReopenCommentChange(issue._id, e.target.value)}
                    />
                    <div className="reopen-form-actions">
                      <button
                        className="reopen-submit-btn"
                        onClick={() => handleReopenSubmit(issue._id)}
                      >
                        <RotateCcw size={16} />
                        Submit Reopen Request
                      </button>
                      <button
                        className="reopen-cancel-btn"
                        onClick={() => handleReopenToggle(issue._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content">
            <img src={selectedImage} alt="Resolution Evidence" />
            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenMyIssues;
