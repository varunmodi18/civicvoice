import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { changePassword } from '@/features/auth/authSlice';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
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
      <div className="settings-header fade-in">
        <Lock size={20} />
        <h3>Change Password</h3>
      </div>
      <p className="settings-text fade-in stagger-1">
        Use a strong password with a mix of letters, numbers, and symbols.
      </p>
      <form className="settings-form scale-in stagger-2" onSubmit={onSubmit}>
        <div className="form-group">
          <label>
            <Lock size={14} />
            Current password
          </label>
          <div className="password-wrapper">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowCurrent((v) => !v)}
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>
            <Lock size={14} />
            New password
          </label>
          <div className="password-wrapper">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowNew((v) => !v)}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" className="secondary-btn">
          Update Password
        </button>
      </form>
      {message && (
        <p className="settings-message ok">
          <CheckCircle size={16} />
          {message}
        </p>
      )}
      {error && (
        <p className="settings-message error">
          <XCircle size={16} />
          {error}
        </p>
      )}
    </div>
  );
};

export default AccountSettings;
