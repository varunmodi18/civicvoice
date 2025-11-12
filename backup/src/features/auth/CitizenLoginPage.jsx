
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register } from './authSlice';
import '@/styles/LoginPage.css';

const CitizenLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('citizen1@civicvoice.local');
  const [password, setPassword] = useState('Citizen@123');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const result = await dispatch(
        login({ email, password, expectedRole: 'citizen' })
      ).unwrap().catch(() => null);
      if (result) navigate('/citizen');
    } else {
      const result = await dispatch(register({ name, email, password }))
        .unwrap()
        .catch(() => null);
      if (result) navigate('/citizen');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass fade-in">
        <div className="auth-card-header">
          <h2>Citizen access</h2>
          <p>
            Report civic issues via chat or quick form and track their status
            visually.
          </p>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
                placeholder="••••••••"
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
            {status === 'loading'
              ? 'Please wait…'
              : mode === 'login'
              ? 'Login as citizen'
              : 'Create citizen account'}
          </button>
        </form>

        <div className="auth-hint">
          <p>
            Seeded citizen: <code>citizen1@civicvoice.local</code> /{' '}
            <code>Citizen@123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitizenLoginPage;
