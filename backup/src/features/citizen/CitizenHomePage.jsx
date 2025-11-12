
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ChatPage from '@/features/chat/ChatPage';
import CitizenIssueForm from './CitizenIssueForm';
import CitizenMyIssues from './CitizenMyIssues';
import '@/styles/CitizenHomePage.css';

const CitizenHomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user || user.role !== 'citizen') {
    navigate('/login/citizen');
  }

  return (
    <div className="citizen-home">
      <div className="citizen-layout">
        <div className="citizen-main">
          <ChatPage />
        </div>
        <aside className="citizen-sidebar">
          <div className="citizen-sidebar-stack">
            <CitizenIssueForm />
            <CitizenMyIssues />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CitizenHomePage;
