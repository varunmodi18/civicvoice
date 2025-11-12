
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
      setDeptUserMessage('Department account created.');
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
    try {
      await dispatch(deleteDepartmentUser(userId)).unwrap();
    } catch {
      // ignore
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
    return d.toLocaleString();
  };

  return (
    <div className="admin-page">
      <div className="admin-card glass slide-up">
        <div className="admin-header">
          <div>
            <h2>Admin dashboard</h2>
            <p>
              View all complaints, forward them to departments, and monitor their
              lifecycle.
            </p>
          </div>
          {user && (
            <span className="admin-user-pill">
              Admin: <strong>{user.name}</strong>
            </span>
          )}
        </div>

        <div className="status-summary">
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

        {status === 'loading' && <p>Loading issues…</p>}
        {error && <p className="admin-error">{error}</p>}

        <div className="issue-list">
          {items.map((issue) => (
            <div key={issue._id} className="issue-card hover-float">
              <div className="issue-header">
                <div>
                  <h3>{issue.issueType}</h3>
                  <p className="issue-meta">
                    {issue.location} • Severity{' '}
                    <strong>{issue.severity}</strong>
                  </p>
                  <p className="issue-meta">
                    Complaint ID:{' '}
                    <code>CV-{issue._id.slice(-6).toUpperCase()}</code>
                  </p>
                </div>
                <span className={`status-badge status-${issue.status}`}>
                  {issue.status}
                </span>
              </div>
              <p className="issue-summary">{issue.summary}</p>
              {issue.forwardedTo && (
                <p className="issue-meta">
                  Forwarded to: <strong>{issue.forwardedTo.name}</strong>
                </p>
              )}
              {issue.departmentUpdates && issue.departmentUpdates.length > 0 && (
                <div className="issue-timeline">
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
              <div className="issue-actions">
                <select
                  defaultValue=""
                  onChange={(e) => handleForward(issue._id, e.target.value)}
                >
                  <option value="">Forward to department…</option>
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
                  <option value="pending">pending</option>
                  <option value="in_review">in_review</option>
                  <option value="completed">completed</option>
                </select>
              </div>
            </div>
          ))}
          {items.length === 0 && status !== 'loading' && (
            <p className="no-issues">
              No issues yet. Ask citizens to submit one via the chat or quick form.
            </p>
          )}
        </div>

        <div className="admin-section">
          <h3>Department accounts</h3>
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
              <option value="">Select department…</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <button type="submit" className="secondary-btn">
              Create account
            </button>
          </form>
          {deptUserMessage && (
            <p className="admin-message ok">{deptUserMessage}</p>
          )}
          {deptUserError && <p className="admin-message error">{deptUserError}</p>}

          <div className="dept-users-list">
            {departmentUsers.length === 0 && (
              <p className="no-issues">No department accounts yet.</p>
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
                    <option value="">Assign department…</option>
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
