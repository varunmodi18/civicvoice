
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyIssues } from '@/features/issues/issuesSlice';
import '@/styles/CitizenMyIssues.css';

const CitizenMyIssues = () => {
  const dispatch = useDispatch();
  const { myIssues } = useSelector((state) => state.issues);

  useEffect(() => {
    dispatch(fetchMyIssues());
  }, [dispatch]);

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div className="citizen-myissues-card glass slide-up">
      <h3>My complaints</h3>
      <p className="citizen-myissues-text">
        Track statuses and see department updates for your complaints.
      </p>
      <div className="citizen-myissues-list">
        {myIssues.length === 0 && (
          <p className="citizen-myissues-empty">
            No complaints yet. Use the chat or quick form to submit one.
          </p>
        )}
        {myIssues.map((issue) => (
          <div key={issue._id} className="citizen-myissues-row">
            <div className="citizen-myissues-header">
              <span className="citizen-myissues-type">{issue.issueType}</span>
              <span className={`status-badge status-${issue.status}`}>
                {issue.status}
              </span>
            </div>
            <p className="citizen-myissues-meta">
              Complaint ID:{' '}
              <code>CV-{issue._id.slice(-6).toUpperCase()}</code> •{' '}
              {formatDateTime(issue.createdAt)}
            </p>
            <p className="citizen-myissues-location">
              Location: <strong>{issue.location}</strong>
            </p>
            {issue.forwardedTo && (
              <p className="citizen-myissues-location">
                Department: <strong>{issue.forwardedTo.name}</strong>
              </p>
            )}
            <p className="citizen-myissues-summary">{issue.summary}</p>
            {issue.departmentUpdates && issue.departmentUpdates.length > 0 && (
              <div className="citizen-myissues-timeline">
                <h4>Department updates</h4>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitizenMyIssues;
