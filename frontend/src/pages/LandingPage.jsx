import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Users, 
  Building2,
  ArrowRight,
  Shield,
  Zap,
  Heart,
  AlertCircle,
  Activity,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import api from '@/lib/apiClient';
import '@/styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeCitizens: 0,
    resolvedIssues: 0,
    departments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentIssues, setRecentIssues] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [closedAlerts, setClosedAlerts] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/issues/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentIssues = async () => {
      try {
        const response = await api.get('/issues/recent?limit=5');
        setRecentIssues(response.data);
      } catch (err) {
        console.error('Failed to fetch recent issues:', err);
      } finally {
        setFeedLoading(false);
      }
    };

    const fetchActiveAlerts = async () => {
      try {
        const response = await api.get('/alerts/active');
        console.log('Fetched alerts:', response.data);
        setAlerts(response.data);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    fetchStats();
    fetchRecentIssues();
    fetchActiveAlerts();
    
    // Refresh recent issues every 30 seconds
    const interval = setInterval(fetchRecentIssues, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseAlert = (alertId) => {
    setClosedAlerts((prev) => [...prev, alertId]);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle size={18} />;
      case 'warning':
        return <AlertCircle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in_review':
        return '#f59e0b';
      case 'pending':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const features = [
    {
      icon: <MessageSquare size={32} />,
      title: 'Interactive Chat System',
      description: 'File complaints through an intuitive conversational interface that guides you step-by-step.'
    },
    {
      icon: <Clock size={32} />,
      title: 'Real-Time Tracking',
      description: 'Track your complaint status in real-time with department updates and resolution evidence.'
    },
    {
      icon: <Building2 size={32} />,
      title: 'Department Coordination',
      description: 'Complaints automatically routed to the right departments for faster resolution.'
    },
    {
      icon: <CheckCircle size={32} />,
      title: 'Transparency',
      description: 'Complete transparency with photo evidence of resolutions and reopen capability.'
    }
  ];

  const statsDisplay = [
    { icon: <Users size={24} />, value: loading ? '...' : `${stats.activeCitizens}+`, label: 'Active Citizens' },
    { icon: <MessageSquare size={24} />, value: loading ? '...' : `${stats.resolvedIssues}+`, label: 'Issues Resolved' },
    { icon: <Building2 size={24} />, value: loading ? '...' : `${stats.departments}+`, label: 'Departments' },
    { icon: <Clock size={24} />, value: '24/7', label: 'Support' }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Report',
      description: 'Submit your civic complaint through our easy chat interface or quick form.'
    },
    {
      step: '2',
      title: 'Track',
      description: 'Monitor the status of your complaint as it gets forwarded to relevant departments.'
    },
    {
      step: '3',
      title: 'Resolve',
      description: 'Receive updates and view resolution evidence when departments fix the issue.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Alerts Bar */}
      {alerts.length > 0 && console.log('Rendering alerts:', alerts)}
      {alerts.filter(alert => !closedAlerts.includes(alert._id)).length > 0 && (
        <div className="alerts-bar">
          {alerts
            .filter(alert => !closedAlerts.includes(alert._id))
            .map((alert) => (
              <div key={alert._id} className={`alert-banner alert-banner-${alert.type}`}>
                <div className="alert-banner-content">
                  <div className="alert-banner-icon">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="alert-banner-text">
                    <strong>{alert.title}</strong>
                    <span>{alert.message}</span>
                  </div>
                </div>
                <button 
                  className="alert-banner-close"
                  onClick={() => handleCloseAlert(alert._id)}
                  aria-label="Close alert"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title slide-up">
              Raise issues.<br />
              Track resolutions.<br />
              <span className="hero-highlight">Shape your city.</span>
            </h1>
            <p className="hero-subtitle fade-in">
              The central hub for CityWorks citizens. Report potholes, sanitation issues, or streetlights in seconds and get real-time updates on your phone.
            </p>
            <div className="hero-buttons fade-in">
              <button 
                className="cta-button primary"
                onClick={() => navigate('/login/citizen')}
              >
                Get Started
                <ArrowRight size={20} />
              </button>
              <button 
                className="cta-button secondary"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="live-feed glass fade-scale">
              <div className="live-feed-header">
                <div className="live-indicator">
                  <Activity size={16} className="pulse" />
                  <span>Live City Feed</span>
                </div>
                <span className="feed-subtitle">Recent issues from your community</span>
              </div>
              <div className="live-feed-content">
                {feedLoading ? (
                  <div className="feed-loading">
                    <Clock size={20} />
                    <span>Loading recent issues...</span>
                  </div>
                ) : recentIssues.length === 0 ? (
                  <div className="feed-empty">
                    <AlertCircle size={20} />
                    <span>No issues reported yet</span>
                  </div>
                ) : (
                  <div className="feed-items">
                    {recentIssues.map((issue) => (
                      <div key={issue._id} className="feed-item hover-float">
                        <div className="feed-item-icon">
                          <MapPin size={14} />
                        </div>
                        <div className="feed-item-content">
                          <div className="feed-item-title">{issue.issueType}</div>
                          <div className="feed-item-location">
                            <MapPin size={10} />
                            {issue.location}
                          </div>
                        </div>
                        <div className="feed-item-meta">
                          <span 
                            className="feed-item-status" 
                            style={{ backgroundColor: getStatusColor(issue.status) }}
                          >
                            {issue.status === 'in_review' ? 'reviewing' : issue.status}
                          </span>
                          <span className="feed-item-time">{formatTimeAgo(issue.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {statsDisplay.map((stat, idx) => (
            <div key={idx} className={`stat-card glass hover-float scale-in stagger-${idx + 1}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="stats-cta">
          <button 
            className="dashboard-btn glass"
            onClick={() => navigate('/dashboard')}
          >
            View Full Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header fade-in">
          <h2 className="section-title">Why Choose CivicVoice?</h2>
          <p className="section-subtitle">
            Empowering citizens with the tools they need to create positive change
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className={`feature-card glass hover-float fade-scale stagger-${idx + 1}`}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header fade-in">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Three simple steps to make your voice heard
          </p>
        </div>
        <div className="steps-container">
          {howItWorks.map((item, idx) => (
            <div key={idx} className={`step-card glass hover-float slide-in-left stagger-${idx + 1}`}>
              <div className="step-number">{item.step}</div>
              <h3 className="step-title">{item.title}</h3>
              <p className="step-description">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* User Types Section */}
      <section className="user-types-section">
        <div className="section-header fade-in">
          <h2 className="section-title">Who We Serve</h2>
          <p className="section-subtitle">
            A platform designed for everyone in the civic ecosystem
          </p>
        </div>
        <div className="user-types-grid">
          <div className="user-type-card glass hover-float scale-in stagger-1">
            <div className="user-type-icon">
              <Heart size={40} />
            </div>
            <h3>Citizens</h3>
            <p>Report issues, track complaints, and see transparent resolutions</p>
            <button className="user-type-btn" onClick={() => navigate('/login/citizen')}>
              Report an Issue
            </button>
          </div>
          <div className="user-type-card glass hover-float scale-in stagger-2">
            <div className="user-type-icon">
              <Building2 size={40} />
            </div>
            <h3>Departments</h3>
            <p>Receive complaints, update statuses, and upload resolution evidence</p>
            <button className="user-type-btn" onClick={() => navigate('/login/department')}>
              Department Login
            </button>
          </div>
          <div className="user-type-card glass hover-float scale-in stagger-3">
            <div className="user-type-icon">
              <Shield size={40} />
            </div>
            <h3>Administrators</h3>
            <p>Manage complaints, forward to departments, and oversee the entire system</p>
            <button className="user-type-btn" onClick={() => navigate('/login/admin')}>
              Admin Access
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content glass fade-scale">
          <div className="cta-icon">
            <Zap size={48} />
          </div>
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of citizens making their communities better</p>
          <button 
            className="cta-button large"
            onClick={() => navigate('/login/citizen')}
          >
            Get Started Now
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>CivicVoice</h3>
            <p>Connecting citizens with their government</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#" onClick={() => navigate('/login')}>Login</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CivicVoice. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
