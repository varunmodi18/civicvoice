import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from './authSlice';
import { Eye, EyeOff, Building2, Mail, Lock } from 'lucide-react';
import '@/styles/LoginPage.css';

const DepartmentLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="auth-card glass scale-in">
        <div className="auth-card-header slide-in-left stagger-1">
          <div className="auth-icon department">
            <Building2 size={24} />
          </div>
          <h2>Department Dashboard</h2>
          <p>
            View issues forwarded to your team and add clear updates for admins and
            citizens.
          </p>
        </div>

        <form className="auth-form slide-in-right stagger-2" onSubmit={onSubmit}>
          <div className="form-group">
            <label>
              <Mail size={14} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="department@civicvoice.local"
              required
            />
          </div>
          <div className="form-group">
            <label>
              <Lock size={14} />
              Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button
            type="submit"
            className="primary-btn w-full"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing in...' : 'Login as department'}
          </button>
        </form>

        <div className="auth-hint fade-in stagger-3">
          <p>
            Demo account: <code>roads@civicvoice.local</code> / <code>Dept@123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentLoginPage;
