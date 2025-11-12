import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitIssue } from '@/features/chat/chatSlice';
import { fetchMyIssues } from '@/features/issues/issuesSlice';
import { FileText, MapPin, Landmark, AlertCircle, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
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

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await dispatch(submitIssue(form)).unwrap();
      setMessage(`Filed complaint: ${res.issueId}`);
      setForm({
        issueType: '',
        location: '',
        landmark: '',
        severity: 'medium',
        description: '',
      });
      // Refresh the citizen's complaints list after successful submission
      dispatch(fetchMyIssues());
    } catch (err) {
      setError(err || 'Failed to submit');
    }
  };

  return (
    <div className="issue-form-card glass fade-in">
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
          <select name="severity" value={form.severity} onChange={onChange}>
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
