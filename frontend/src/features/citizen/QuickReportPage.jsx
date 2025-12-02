import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CitizenIssueForm from './CitizenIssueForm';
import '@/styles/CitizenHomePage.css';

const QuickReportPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user || user.role !== 'citizen') {
    navigate('/login/citizen');
  }

  const handleBack = () => {
    navigate('/citizen');
  };

  return (
    <div className="citizen-home">
      <div className="quick-report-container">
        <button className="quick-report-back-btn" onClick={handleBack}>
          <ArrowLeft size={16} />
          Back to Home
        </button>
        <CitizenIssueForm />
      </div>
    </div>
  );
};

export default QuickReportPage;
