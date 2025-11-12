
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from './authSlice';
import '@/styles/LoginPage.css';

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('admin@civicvoice.local');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      login({ email, password, expectedRole: 'admin' })
    ).unwrap().catch(() => null);
    if (result) navigate('/admin');
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass fade-in">
        <div className="auth-card-header">
          <h2>Admin console</h2>
          <p>Review and route citizen complaints with a visual status overview.</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button
            type="submit"
            className="primary-btn w-full"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing in…' : 'Login as admin'}
          </button>
        </form>

        <div className="auth-hint">
          <p>
            Seeded admin: <code>admin@civicvoice.local</code> /{' '}
            <code>Admin@123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
