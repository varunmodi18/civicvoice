import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDepartmentIssues,
  departmentUpdateIssue,
} from '@/features/issues/issuesSlice';
import { Building2, Clock, MapPin, AlertTriangle, Save, MessageSquare } from 'lucide-react';
import '@/styles/DepartmentHomePage.css';

const DepartmentHomePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { departmentIssues } = useSelector((state) => state.issues);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});

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

  const handleSubmitUpdate = async (issueId) => {
    const comment = commentDrafts[issueId];
    const status = statusDrafts[issueId];

    if (!comment && !status) return;

    await dispatch(
      departmentUpdateIssue({
        id: issueId,
        data: { comment: comment || undefined, status: status || undefined },
      })
    ).unwrap();

    setCommentDrafts((prev) => ({ ...prev, [issueId]: '' }));
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
