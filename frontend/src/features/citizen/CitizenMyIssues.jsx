import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyIssues } from '@/features/issues/issuesSlice';
import { FileText, MapPin, Building2, Clock, AlertCircle } from 'lucide-react';
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitizenMyIssues;
