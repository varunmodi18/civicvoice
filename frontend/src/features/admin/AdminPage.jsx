import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIssues,
  fetchDepartments,
  updateIssue,
  deleteIssue,
  fetchDepartmentUsers,
  createDepartmentUser,
  updateDepartmentUser,
  deleteDepartmentUser,
  reopenIssue,
} from '@/features/issues/issuesSlice';
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  MapPin,
  Building2,
  Send,
  UserPlus,
  Trash2,
  MessageSquare,
  FileText,
  RotateCcw,
  Image as ImageIcon,
  Filter,
  X,
} from 'lucide-react';
import '@/styles/AdminPage.css';

const AdminPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, departments, status, error, departmentUsers } = useSelector(
    (state) => state.issues
  );

  const [newDeptUser, setNewDeptUser] = useState({
    name: '',
    email: '',
    password: '',
    departmentName: '',
  });
  const [deptUserMessage, setDeptUserMessage] = useState(null);
  const [deptUserError, setDeptUserError] = useState(null);
  const [reopenComments, setReopenComments] = useState({});
  const [showReopenForm, setShowReopenForm] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    department: '',
    status: '',
    recurrence: '',
    dateFrom: '',
    dateTo: '',
  });
  const [activeTab, setActiveTab] = useState('complaints');

  useEffect(() => {
    dispatch(fetchIssues());
    dispatch(fetchDepartments());
    dispatch(fetchDepartmentUsers());
  }, [dispatch]);

  const handleForward = (issueId, deptId) => {
    if (!deptId) return;
    dispatch(updateIssue({ id: issueId, data: { forwardedTo: deptId } }));
  };

  const handleStatusChange = (issueId, statusValue) => {
    dispatch(updateIssue({ id: issueId, data: { status: statusValue } }));
  };

  const onChangeNewDeptUser = (e) => {
    setNewDeptUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateDeptUser = async (e) => {
    e.preventDefault();
    setDeptUserMessage(null);
    setDeptUserError(null);
    if (
      !newDeptUser.name ||
      !newDeptUser.email ||
      !newDeptUser.password ||
      !newDeptUser.departmentName
    ) {
      setDeptUserError('Fill all fields to create a department account.');
      return;
    }
    try {
      await dispatch(createDepartmentUser(newDeptUser)).unwrap();
      setDeptUserMessage('Department account created successfully.');
      setNewDeptUser({
        name: '',
        email: '',
        password: '',
        departmentName: '',
      });
      // Refresh departments list to include any newly created department
      dispatch(fetchDepartments());
    } catch (err) {
      setDeptUserError(err || 'Failed to create account.');
    }
  };

  const handleChangeDeptForUser = (userId, departmentId) => {
    if (!departmentId) return;
    dispatch(updateDepartmentUser({ id: userId, data: { departmentId } }));
  };

  const handleDeleteDeptUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this department account?')) {
      try {
        await dispatch(deleteDepartmentUser(userId)).unwrap();
      } catch {
        // ignore
      }
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      try {
        await dispatch(deleteIssue(issueId)).unwrap();
      } catch (err) {
        alert(err || 'Failed to delete complaint.');
      }
    }
  };

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
      dispatch(fetchIssues());
    } catch (err) {
      alert(err || 'Failed to reopen issue.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      severity: '',
      department: '',
      status: '',
      recurrence: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    if (filters.severity) {
      filtered = filtered.filter((i) => i.severity === filters.severity);
    }

    if (filters.department) {
      filtered = filtered.filter((i) => i.forwardedTo?._id === filters.department);
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
  }, [items, filters]);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, in_review: 0, completed: 0 };
    filteredItems.forEach((i) => {
      if (i.status === 'pending') counts.pending += 1;
      else if (i.status === 'in_review') counts.in_review += 1;
      else if (i.status === 'completed') counts.completed += 1;
    });
    return counts;
  }, [filteredItems]);

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
    <div className="admin-page">
      <div className="admin-card glass slide-up">
        <div className="admin-header">
          <div className="admin-header-content">
            <div className="admin-icon">
              <Shield size={24} />
            </div>
            <div>
              <h2>Admin Dashboard</h2>
              <p>
                Manage complaints, departments, and monitor the system.
              </p>
            </div>
          </div>
          {user && (
            <span className="admin-user-pill">
              <Shield size={12} />
              {user.name}
            </span>
          )}
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <FileText size={18} />
            Complaints Management
          </button>
          <button 
            className={`admin-tab ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <UserPlus size={18} />
            Department Accounts
          </button>
        </div>

        {activeTab === 'complaints' && (
          <>
            <div className="status-summary">
          <div className="status-pill pending">
            <AlertTriangle size={16} />
            Pending <span>{statusCounts.pending}</span>
          </div>
          <div className="status-pill in_review">
            <Clock size={16} />
            In Review <span>{statusCounts.in_review}</span>
          </div>
          <div className="status-pill completed">
            <CheckCircle size={16} />
            Completed <span>{statusCounts.completed}</span>
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
                  <label>Department</label>
                  <select 
                    value={filters.department} 
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  >
                    <option value="">All</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
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
                  Showing {filteredItems.length} of {items.length} complaints
                </span>
              </div>
            </div>
          )}
        </div>

        {status === 'loading' && <p className="loading-text">Loading issues...</p>}
        {error && <p className="admin-error">{error}</p>}

        <div className="issue-list">
          {filteredItems.map((issue) => (
            <div key={issue._id} className="issue-card hover-float">
              <div className="issue-header">
                <div>
                  <h3>{issue.issueType}</h3>
                  <p className="issue-meta">
                    <MapPin size={14} />
                    {issue.location}
                    <span>•</span>
                    <AlertTriangle size={14} />
                    Severity: <span className={`severity-badge severity-${issue.severity}`}>{issue.severity}</span>
                  </p>
                  <p className="issue-meta">
                    <code>CV-{issue._id.slice(-6).toUpperCase()}</code>
                  </p>
                </div>
                <span className={`status-badge status-${issue.status}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <p className="issue-summary">{issue.summary}</p>
              {issue.forwardedTo && (
                <p className="issue-meta">
                  <Building2 size={14} />
                  Forwarded to: <strong>{issue.forwardedTo.name}</strong>
                </p>
              )}
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
                <div className="issue-timeline">
                  <h4>
                    <MessageSquare size={14} />
                    Department Updates
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
              <div className="issue-actions">
                <select
                  value={issue.forwardedTo?._id || ''}
                  onChange={(e) => handleForward(issue._id, e.target.value)}
                >
                  <option value="">
                    <Send size={14} /> Forward to department...
                  </option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  type="button"
                  className="ghost-btn delete-issue-btn"
                  onClick={() => handleDeleteIssue(issue._id)}
                  title="Delete this complaint"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
              {issue.status === 'completed' && (
                <div className="reopen-section">
                  {!showReopenForm[issue._id] ? (
                    <button
                      className="reopen-btn"
                      onClick={() => handleReopenToggle(issue._id)}
                    >
                      <RotateCcw size={16} />
                      Reopen Issue
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
          {filteredItems.length === 0 && items.length === 0 && status !== 'loading' && (
            <p className="no-issues">
              <FileText size={24} />
              No issues yet. Ask citizens to submit one via the chat or quick form.
            </p>
          )}
        </div>
          </>
        )}

        {activeTab === 'departments' && (
          <div className="admin-section">
          <div className="admin-section-header">
            <UserPlus size={20} />
            <h3>Department Accounts</h3>
          </div>
          <p className="admin-section-text">
            Create and manage department login accounts that will receive forwarded
            complaints.
          </p>
          <form className="dept-user-form" onSubmit={handleCreateDeptUser}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newDeptUser.name}
              onChange={onChangeNewDeptUser}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newDeptUser.email}
              onChange={onChangeNewDeptUser}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newDeptUser.password}
              onChange={onChangeNewDeptUser}
            />
            <input
              type="text"
              name="departmentName"
              placeholder="Department Name (e.g., Water Supply, Roads)"
              value={newDeptUser.departmentName}
              onChange={onChangeNewDeptUser}
            />
            <button type="submit" className="secondary-btn">
              <UserPlus size={16} />
              Create Account
            </button>
          </form>
          {deptUserMessage && (
            <p className="admin-message ok">
              <CheckCircle size={16} />
              {deptUserMessage}
            </p>
          )}
          {deptUserError && (
            <p className="admin-message error">
              <AlertTriangle size={16} />
              {deptUserError}
            </p>
          )}

          <div className="dept-users-list">
            {departmentUsers.length === 0 && (
              <p className="no-issues">
                <Building2 size={20} />
                No department accounts yet.
              </p>
            )}
            {departmentUsers.map((u) => (
              <div key={u._id} className="dept-user-row hover-float">
                <div className="dept-user-main">
                  <div className="dept-user-name">{u.name}</div>
                  <div className="dept-user-email">{u.email}</div>
                </div>
                <div className="dept-user-controls">
                  <select
                    value={u.department?._id || ''}
                    onChange={(e) => handleChangeDeptForUser(u._id, e.target.value)}
                  >
                    <option value="">Assign department...</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="dept-user-delete ghost-btn"
                    onClick={() => handleDeleteDeptUser(u._id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
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

export default AdminPage;
