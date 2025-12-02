
import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import CitizenLoginPage from '@/features/auth/CitizenLoginPage';
import AdminLoginPage from '@/features/auth/LoginPage';
import DepartmentLoginPage from '@/features/auth/DepartmentLoginPage';
import CitizenHomePage from '@/features/citizen/CitizenHomePage';
import QuickReportPage from '@/features/citizen/QuickReportPage';
import AdminPage from '@/features/admin/AdminPage';
import DepartmentHomePage from '@/features/department/DepartmentHomePage';
import AccountPage from '@/features/account/AccountPage';
import { fetchMe } from '@/features/auth/authSlice';

const AppShell = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isDashboardPage = location.pathname === '/dashboard';

  const handleLogoClick = () => {
    if (user?.role === 'citizen') navigate('/citizen');
    else if (user?.role === 'admin') navigate('/admin');
    else if (user?.role === 'department') navigate('/department');
    else navigate('/');
  };

  // Don't show header/footer on landing page or dashboard page
  if (isLandingPage || isDashboardPage) {
    return <div className="app-root">{children}</div>;
  }

  return (
    <div className="app-root">
      <div className="animated-bg"></div>
      <header className="app-header fade-in">
        <button className="logo-btn" onClick={handleLogoClick}>
          <span className="logo-mark">CV</span>
          <span className="logo-text">
            Civic<span>Voice</span>
          </span>
        </button>
        <nav className="nav-links">
          {user ? (
            <>
              {user.role === 'citizen' && (
                <Link to="/quick-report" className="nav-link">
                  Quick Report
                </Link>
              )}
              <Link to="/account" className="nav-link nav-pill">
                My Account
              </Link>
            </>
          ) : (
            <>
              <Link to="/login/citizen" className="nav-link">
                Citizen
              </Link>
              <Link to="/login/admin" className="nav-link">
                Admin
              </Link>
              <Link to="/login/department" className="nav-link">
                Department
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main slide-up">{children}</main>
      <footer className="app-footer fade-in">
        <span>CivicVoice · Smart civic issue reporting & tracking</span>
      </footer>
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isDashboardPage = location.pathname === '/dashboard';

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/login/citizen" element={<CitizenLoginPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/login/department" element={<DepartmentLoginPage />} />
        <Route path="/citizen" element={<CitizenHomePage />} />
        <Route path="/quick-report" element={<QuickReportPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/department" element={<DepartmentHomePage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </AppShell>
  );
};

export default App;
