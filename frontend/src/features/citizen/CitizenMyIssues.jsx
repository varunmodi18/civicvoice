import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyIssues, reopenIssue } from '@/features/issues/issuesSlice';
import api from '@/lib/apiClient';
import { FileText, MapPin, Building2, Clock, AlertCircle, RotateCcw, Image as ImageIcon, Filter, X, AlertTriangle, Star } from 'lucide-react';
import '@/styles/CitizenMyIssues.css';

const CitizenMyIssues = () => {
  const dispatch = useDispatch();
  const { myIssues } = useSelector((state) => state.issues);
  const [reopenComments, setReopenComments] = useState({});
  const [showReopenForm, setShowReopenForm] = useState({});
  const [showRatingForm, setShowRatingForm] = useState({});
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [hoveredStar, setHoveredStar] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    recurrence: '',
    dateFrom: '',
    dateTo: '',
  });

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

  const handleRatingToggle = (issueId) => {
    setShowRatingForm((prev) => ({ ...prev, [issueId]: !prev[issueId] }));
  };

  const handleRatingChange = (issueId, rating) => {
    setRatings((prev) => ({ ...prev, [issueId]: rating }));
  };

  const handleReviewChange = (issueId, value) => {
    setReviews((prev) => ({ ...prev, [issueId]: value }));
  };

  const handleRatingSubmit = async (issueId) => {
    const rating = ratings[issueId];
    if (!rating) {
      alert('Please select a rating.');
      return;
    }

    try {
      await api.patch(`/issues/${issueId}/rate`, {
        rating,
        review: reviews[issueId] || '',
      });
      setRatings((prev) => ({ ...prev, [issueId]: undefined }));
      setReviews((prev) => ({ ...prev, [issueId]: '' }));
      setShowRatingForm((prev) => ({ ...prev, [issueId]: false }));
      dispatch(fetchMyIssues());
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      severity: '',
      status: '',
      recurrence: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const filteredIssues = React.useMemo(() => {
    let filtered = [...myIssues];

    if (filters.severity) {
      filtered = filtered.filter((i) => i.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter((i) => i.status === filters.status);
    }

    if (filters.recurrence) {
      filtered = filtered.filter((i) => i.recurrence === filters.recurrence);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((i) => new Date(i.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((i) => new Date(i.createdAt) <= toDate);
    }

    return filtered;
  }, [myIssues, filters]);

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

      <div className="filter-section">
        <button 
          className="filter-toggle-btn secondary-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {Object.values(filters).some(v => v) && (
            <span className="filter-count">{Object.values(filters).filter(v => v).length}</span>
          )}
        </button>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-grid">
              <div className="filter-group">
                <label>Severity</label>
                <select 
                  value={filters.severity} 
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="reopened">Reopened</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Recurrence</label>
                <select 
                  value={filters.recurrence} 
                  onChange={(e) => handleFilterChange('recurrence', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="new">New</option>
                  <option value="recurring">Recurring</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Date From</label>
                <input 
                  type="date" 
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Date To</label>
                <input 
                  type="date" 
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-actions">
              <button className="ghost-btn" onClick={clearFilters}>
                <X size={16} />
                Clear All
              </button>
              <span className="filter-result-count">
                Showing {filteredIssues.length} of {myIssues.length} complaints
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="citizen-myissues-list">
        {filteredIssues.length === 0 && myIssues.length === 0 && (
          <div className="citizen-myissues-empty">
            <AlertCircle size={24} />
            <p>No complaints yet. Use the chat or quick form to submit one.</p>
          </div>
        )}
        {filteredIssues.length === 0 && myIssues.length > 0 && (
          <div className="citizen-myissues-empty">
            <AlertCircle size={24} />
            <p>No complaints match the selected filters.</p>
          </div>
        )}
        {filteredIssues.map((issue, idx) => (
          <div key={issue._id} className={`citizen-myissues-row hover-float fade-scale stagger-${Math.min(idx + 1, 5)}`}>
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
              <>
                {/* Rating Section */}
                {!issue.rating && (
                  <div className="rating-section">
                    {!showRatingForm[issue._id] ? (
                      <button
                        className="rating-btn"
                        onClick={() => handleRatingToggle(issue._id)}
                      >
                        <Star size={16} />
                        Rate Resolution
                      </button>
                    ) : (
                      <div className="rating-form">
                        <h4>Rate the Resolution</h4>
                        <div className="stars-container">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              className={`star-btn ${
                                (hoveredStar[issue._id] || ratings[issue._id] || 0) >= star
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={() => handleRatingChange(issue._id, star)}
                              onMouseEnter={() => setHoveredStar((prev) => ({ ...prev, [issue._id]: star }))}
                              onMouseLeave={() => setHoveredStar((prev) => ({ ...prev, [issue._id]: 0 }))}
                            >
                              <Star size={24} fill={(hoveredStar[issue._id] || ratings[issue._id] || 0) >= star ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Share your experience with the resolution (optional)..."
                          value={reviews[issue._id] || ''}
                          onChange={(e) => handleReviewChange(issue._id, e.target.value)}
                        />
                        <div className="rating-form-actions">
                          <button
                            className="rating-submit-btn"
                            onClick={() => handleRatingSubmit(issue._id)}
                          >
                            <Star size={16} />
                            Submit Rating
                          </button>
                          <button
                            className="rating-cancel-btn"
                            onClick={() => handleRatingToggle(issue._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Display existing rating */}
                {issue.rating && (
                  <div className="existing-rating">
                    <h4>Your Rating</h4>
                    <div className="stars-display">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          fill={star <= issue.rating ? '#fbbf24' : 'none'}
                          color={star <= issue.rating ? '#fbbf24' : '#d1d5db'}
                        />
                      ))}
                      <span className="rating-text">({issue.rating}/5)</span>
                    </div>
                    {issue.review && (
                      <p className="review-text">{issue.review}</p>
                    )}
                  </div>
                )}

                {/* Reopen Section */}
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
              </>
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
