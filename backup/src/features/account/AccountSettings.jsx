
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { changePassword } from '@/features/auth/authSlice';
import '@/styles/AccountSettings.css';

const AccountSettings = () => {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err || 'Failed to change password');
    }
  };

  return (
    <div className="account-settings">
      <h3>Change password</h3>
      <p className="settings-text">
        Use a strong password with a mix of letters, numbers, and symbols.
      </p>
      <form className="settings-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Current password</label>
          <div className="password-wrapper">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowCurrent((v) => !v)}
            >
              {showCurrent ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>New password</label>
          <div className="password-wrapper">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowNew((v) => !v)}
            >
              {showNew ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <button type="submit" className="secondary-btn">
          Update password
        </button>
      </form>
      {message && <p className="settings-message ok">{message}</p>}
      {error && <p className="settings-message error">{error}</p>}
    </div>
  );
};

export default AccountSettings;
