import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIssues,
  fetchDepartments,
  updateIssue,
  fetchDepartmentUsers,
  createDepartmentUser,
  updateDepartmentUser,
  deleteDepartmentUser,
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
    departmentId: '',
  });
  const [deptUserMessage, setDeptUserMessage] = useState(null);
  const [deptUserError, setDeptUserError] = useState(null);

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
      !newDeptUser.departmentId
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
        departmentId: '',
      });
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

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, in_review: 0, completed: 0 };
    items.forEach((i) => {
      if (i.status === 'pending') counts.pending += 1;
      else if (i.status === 'in_review') counts.in_review += 1;
      else if (i.status === 'completed') counts.completed += 1;
    });
    return counts;
  }, [items]);

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
                View all complaints, forward them to departments, and monitor their
                lifecycle.
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

        <div className="status-summary">
          <div className="status-pill">
            <AlertTriangle size={16} />
            Pending <span>{statusCounts.pending}</span>
          </div>
          <div className="status-pill">
            <Clock size={16} />
            In Review <span>{statusCounts.in_review}</span>
          </div>
          <div className="status-pill">
            <CheckCircle size={16} />
            Completed <span>{statusCounts.completed}</span>
          </div>
        </div>

        {status === 'loading' && <p className="loading-text">Loading issues...</p>}
        {error && <p className="admin-error">{error}</p>}

        <div className="issue-list">
          {items.map((issue) => (
            <div key={issue._id} className="issue-card hover-float">
              <div className="issue-header">
                <div>
                  <h3>{issue.issueType}</h3>
                  <p className="issue-meta">
                    <MapPin size={14} />
                    {issue.location}
                    <span>•</span>
                    <AlertTriangle size={14} />
                    Severity: <strong>{issue.severity}</strong>
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
                  defaultValue=""
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
              </div>
            </div>
          ))}
          {items.length === 0 && status !== 'loading' && (
            <p className="no-issues">
              <FileText size={24} />
              No issues yet. Ask citizens to submit one via the chat or quick form.
            </p>
          )}
        </div>

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
            <select
              name="departmentId"
              value={newDeptUser.departmentId}
              onChange={onChangeNewDeptUser}
            >
              <option value="">Select department...</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
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
      </div>
    </div>
  );
};

export default AdminPage;
