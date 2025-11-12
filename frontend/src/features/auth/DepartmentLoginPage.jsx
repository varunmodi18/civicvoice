
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from './authSlice';
import '@/styles/LoginPage.css';

const DepartmentLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('roads@civicvoice.local');
  const [password, setPassword] = useState('Dept@123');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      login({ email, password, expectedRole: 'department' })
    ).unwrap().catch(() => null);
    if (result) navigate('/department');
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass fade-in">
        <div className="auth-card-header">
          <h2>Department dashboard</h2>
          <p>
            View issues forwarded to your team and add clear updates for admins and
            citizens.
          </p>
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
            {status === 'loading' ? 'Signing in…' : 'Login as department'}
          </button>
        </form>

        <div className="auth-hint">
          <p>
            Seeded dept: <code>roads@civicvoice.local</code> / <code>Dept@123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentLoginPage;
