import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountSettings from './AccountSettings';
import { logout } from '@/features/auth/authSlice';
import { User, LogOut, Settings, ArrowLeft } from 'lucide-react';
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

  const handleBack = () => {
    if (user?.role === 'citizen') navigate('/citizen');
    else if (user?.role === 'admin') navigate('/admin');
    else if (user?.role === 'department') navigate('/department');
    else navigate('/login/citizen');
  };

  return (
    <div className="account-page">
      <div className="account-card glass scale-in">
        <div className="account-header slide-in-left stagger-1">
          <button type="button" className="account-back-btn" onClick={handleBack}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="account-header-wrapper">
            <div className="account-header-content">
              <div className="account-icon">
                <User size={24} />
              </div>
              <div>
                <h2>My Account</h2>
                <p>Manage your CivicVoice profile and security</p>
              </div>
            </div>
            <div className="account-identity">
              <span className="role-pill">{user?.role}</span>
              <span className="account-email">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="account-tabs fade-in stagger-2">
          <button className="account-tab active">
            <Settings size={14} />
            Account Settings
          </button>
        </div>

        <div className="account-content slide-in-right stagger-3">
          <AccountSettings />
          <div className="account-actions">
            <button type="button" className="ghost-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
