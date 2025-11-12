
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountSettings from './AccountSettings';
import { logout } from '@/features/auth/authSlice';
import '@/styles/AccountPage.css';

const AccountPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login/citizen');
  }

  const handleLogout = async () => {
    await dispatch(logout()).unwrap().catch(() => null);
    navigate('/login/citizen');
  };

  return (
    <div className="account-page">
      <div className="account-card glass slide-up">
        <div className="account-header">
          <div>
            <h2>My account</h2>
            <p>Manage your CivicVoice profile and security.</p>
          </div>
          <div className="account-identity">
            <span className="role-pill">{user?.role}</span>
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="account-tabs">
          <button className="account-tab active">Account</button>
        </div>

        <div className="account-content">
          <AccountSettings />
          <div className="account-actions">
            <button type="button" className="ghost-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
