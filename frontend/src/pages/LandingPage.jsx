import React from 'react';
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
  Heart
} from 'lucide-react';
import '@/styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

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

  const stats = [
    { icon: <Users size={24} />, value: '1000+', label: 'Active Citizens' },
    { icon: <MessageSquare size={24} />, value: '5000+', label: 'Issues Resolved' },
    { icon: <Building2 size={24} />, value: '50+', label: 'Departments' },
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
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title slide-up">
              Your Voice for a Better City
            </h1>
            <p className="hero-subtitle fade-in">
              Report civic issues, track resolutions, and make your community better with CivicVoice - 
              the smart platform connecting citizens with local departments.
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
            <div className="floating-card card-1 hover-float scale-in stagger-2">
              <MapPin size={24} />
              <span>Report Issue</span>
            </div>
            <div className="floating-card card-2 hover-float scale-in stagger-3">
              <Clock size={24} />
              <span>Track Progress</span>
            </div>
            <div className="floating-card card-3 hover-float scale-in stagger-4">
              <CheckCircle size={24} />
              <span>Issue Resolved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, idx) => (
            <div key={idx} className={`stat-card glass hover-float scale-in stagger-${idx + 1}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
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
