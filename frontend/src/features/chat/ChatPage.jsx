
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addUserMessage,
  captureAnswer,
  nextStep,
  resetChat,
  steps,
  submitIssue,
  uploadEvidence,
} from './chatSlice';
import '@/styles/ChatPage.css';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { messages, stepIndex, issueData, evidenceUrls, lastIssue, status } =
    useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    setInput('');
    dispatch(addUserMessage(text));

    const currentStep = steps[stepIndex];
    if (currentStep) {
      let value = text;
      if (['landmark', 'contactName', 'contactPhone', 'contactEmail'].includes(currentStep.key)) {
        if (text.toLowerCase() === 'skip') {
          value = '';
        }
      }
      dispatch(captureAnswer({ key: currentStep.key, value }));

      if (stepIndex < steps.length - 1) {
        dispatch(nextStep());
      } else {
        const payload = {
          ...issueData,
          [currentStep.key]: value,
          evidenceUrls,
        };
        dispatch(submitIssue(payload));
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await dispatch(uploadEvidence(file)).unwrap();
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    dispatch(resetChat());
  };

  return (
    <div className="chat-card glass slide-up">
      <div className="chat-header">
        <div>
          <h3>Civic assistant</h3>
          <p>Answer a few guided questions to file a detailed complaint.</p>
        </div>
        {user && (
          <span className="chat-user-pill">
            Logged in as <strong>{user.name}</strong>
          </span>
        )}
      </div>

      <div className="chat-body">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-bubble-wrapper ${m.from === 'user' ? 'align-right' : 'align-left'}`}
          >
            <div className={`chat-bubble ${m.from === 'user' ? 'from-user' : 'from-system'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-footer">
        <div className="chat-actions-row">
          <label className="secondary-btn file-btn">
            {uploading ? 'Uploading…' : 'Attach photo/video'}
            <input type="file" onChange={handleFileChange} disabled={uploading} />
          </label>
          {lastIssue && (
            <button type="button" className="ghost-btn" onClick={handleReset}>
              File another complaint
            </button>
          )}
        </div>
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your reply here…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="primary-btn"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
