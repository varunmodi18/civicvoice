import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ChatPage from '@/features/chat/ChatPage';
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
      <div className="citizen-layout-horizontal">
        <div className="citizen-chat-column slide-in-left">
          <ChatPage />
        </div>
        <div className="citizen-issues-column slide-in-right stagger-2">
          <CitizenMyIssues />
        </div>
      </div>
    </div>
  );
};

export default CitizenHomePage;
