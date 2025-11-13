import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast-container">
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          <CheckCircle className="toast-icon" size={24} />
        </div>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="toast-progress"></div>
    </div>
  );
};

export default Toast;
