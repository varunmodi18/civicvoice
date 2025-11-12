
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDepartmentIssues,
  departmentUpdateIssue,
} from '@/features/issues/issuesSlice';
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
    return d.toLocaleString();
  };

  return (
    <div className="department-home">
      <div className="department-card glass slide-up">
        <div className="department-header">
          <div>
            <h2>{user?.department?.name || 'Department dashboard'}</h2>
            <p>
              Work through forwarded complaints, update statuses, and leave clear notes
              for admins and citizens.
            </p>
          </div>
        </div>

        <div className="status-summary dept-summary">
          <div className="status-pill">
            Pending <span>{statusCounts.pending}</span>
          </div>
          <div className="status-pill">
            In review <span>{statusCounts.in_review}</span>
          </div>
          <div className="status-pill">
            Completed <span>{statusCounts.completed}</span>
          </div>
        </div>

        <div className="dept-issue-list">
          {departmentIssues.length === 0 && (
            <p className="no-issues">
              No complaints have been forwarded to this department yet.
            </p>
          )}
          {departmentIssues.map((issue) => (
            <div key={issue._id} className="dept-issue-card hover-float">
              <div className="dept-issue-header">
                <div>
                  <h3>{issue.issueType}</h3>
                  <p className="dept-issue-meta">
                    Location: <strong>{issue.location}</strong> • Severity{' '}
                    <strong>{issue.severity}</strong>
                  </p>
                  <p className="dept-issue-meta">
                    Complaint ID:{' '}
                    <code>CV-{issue._id.slice(-6).toUpperCase()}</code>
                  </p>
                </div>
                <span className={`status-badge status-${issue.status}`}>
                  {issue.status}
                </span>
              </div>
              <p className="dept-issue-summary">{issue.summary}</p>

              {issue.departmentUpdates && issue.departmentUpdates.length > 0 && (
                <div className="issue-timeline">
                  <h4>Update timeline</h4>
                  <ul>
                    {issue.departmentUpdates.map((u, idx) => (
                      <li key={idx}>
                        <span className="timeline-time">
                          {formatDateTime(u.createdAt)}
                        </span>
                        <span className="timeline-text">
                          [{u.status}] {u.text}
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
                  <option value="pending">pending</option>
                  <option value="in_review">in_review</option>
                  <option value="completed">completed</option>
                </select>
              </div>

              <div className="dept-comment-box">
                <textarea
                  rows={3}
                  placeholder="Add a brief note about what your team is doing…"
                  value={commentDrafts[issue._id] || ''}
                  onChange={(e) => handleCommentChange(issue._id, e.target.value)}
                />
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleSubmitUpdate(issue._id)}
                >
                  Save update
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
