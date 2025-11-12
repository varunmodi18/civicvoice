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
import { fetchMyIssues } from '@/features/issues/issuesSlice';
import { MessageSquare, Send, Paperclip, RotateCcw, Loader2, User, Bot, X, FileText, Image, Film, FileUp } from 'lucide-react';
import '@/styles/ChatPage.css';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { messages, stepIndex, issueData, evidenceUrls, evidenceFiles, lastIssue, status } =
    useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    const currentStep = steps[stepIndex];
    
    if (currentStep) {
      let value = text;
      
      // Validate severity input
      if (currentStep.key === 'severity') {
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        if (!validSeverities.includes(text.toLowerCase())) {
          dispatch(addUserMessage(text));
          dispatch({
            type: 'chat/addSystemMessage',
            payload: `Sorry, "${text}" is not a valid severity level. Please choose one of: low, medium, high, or critical.`,
          });
          setInput('');
          return;
        }
        value = text.toLowerCase();
      }
      
      // Validate recurrence input
      if (currentStep.key === 'recurrence') {
        const validRecurrences = ['new', 'recurring', 'ongoing'];
        if (!validRecurrences.includes(text.toLowerCase())) {
          dispatch(addUserMessage(text));
          dispatch({
            type: 'chat/addSystemMessage',
            payload: `Sorry, "${text}" is not a valid option. Please choose one of: new, recurring, or ongoing.`,
          });
          setInput('');
          return;
        }
        value = text.toLowerCase();
      }
      
      // Validate email format (if not skipping)
      if (currentStep.key === 'contactEmail' && text.toLowerCase() !== 'skip') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
          dispatch(addUserMessage(text));
          dispatch({
            type: 'chat/addSystemMessage',
            payload: `Sorry, "${text}" doesn't look like a valid email address. Please enter a valid email or type "skip" to continue.`,
          });
          setInput('');
          return;
        }
      }
      
      // Handle skippable fields
      if (['landmark', 'contactName', 'contactPhone', 'contactEmail'].includes(currentStep.key)) {
        if (text.toLowerCase() === 'skip') {
          value = '';
        }
      }
      
      setInput('');
      dispatch(addUserMessage(text));
      dispatch(captureAnswer({ key: currentStep.key, value }));

      if (stepIndex < steps.length - 1) {
        dispatch(nextStep());
      } else {
        const payload = {
          ...issueData,
          [currentStep.key]: value,
          evidenceUrls,
        };
        try {
          await dispatch(submitIssue(payload)).unwrap();
          // Refresh the citizen's complaints list after successful submission
          if (user && user.role === 'citizen') {
            dispatch(fetchMyIssues());
          }
        } catch (err) {
          // Error already handled in the slice
        }
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    // Check maximum 3 files
    if (selectedFiles.length + files.length > 3) {
      errors.push('You can only attach up to 3 files');
      setUploadErrors(errors);
      return;
    }

    files.forEach(file => {
      // Check file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name} exceeds 50MB limit`);
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} is not a valid file type`);
        return;
      }

      validFiles.push(file);
    });

    setUploadErrors(errors);
    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      await dispatch(uploadEvidence(selectedFiles)).unwrap();
      setSelectedFiles([]);
      setShowUploadModal(false);
      setUploadErrors([]);
    } catch (err) {
      setUploadErrors([err || 'Upload failed. Please try again.']);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image size={20} />;
    if (file.type === 'video/mp4') return <Film size={20} />;
    if (file.type === 'application/pdf') return <FileText size={20} />;
    return <FileUp size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReset = () => {
    dispatch(resetChat());
    setSelectedFiles([]);
    setUploadErrors([]);
  };

  return (
    <div className="chat-card glass slide-up">
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-header-icon">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3>Civic Assistant</h3>
            <p>Answer guided questions to file a detailed complaint</p>
          </div>
        </div>
        {user && (
          <span className="chat-user-pill">
            <User size={12} />
            {user.name}
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
              {m.from === 'system' && (
                <div className="chat-bubble-icon">
                  <Bot size={16} />
                </div>
              )}
              <div className="chat-bubble-text">{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Evidence Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content evidence-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Attach Evidence</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-info">
                Upload up to 3 files (JPG, PNG, PDF, or MP4). Max 50MB per file.
              </p>
              
              {uploadErrors.length > 0 && (
                <div className="upload-errors">
                  {uploadErrors.map((error, i) => (
                    <p key={i} className="error-text">{error}</p>
                  ))}
                </div>
              )}

              <div className="file-upload-area">
                <label className="file-upload-label">
                  <FileUp size={32} />
                  <span>Click to select files</span>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.mp4"
                    onChange={handleFileSelect}
                    disabled={selectedFiles.length >= 3}
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="selected-files-list">
                  <h4>Selected Files ({selectedFiles.length}/3)</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        {getFileIcon(file)}
                        <div>
                          <p className="file-name">{file.name}</p>
                          <p className="file-size">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button className="remove-file-btn" onClick={() => removeFile(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {evidenceFiles.length > 0 && (
                <div className="uploaded-files-list">
                  <h4>Already Uploaded ({evidenceFiles.length})</h4>
                  {evidenceFiles.map((file, index) => (
                    <div key={index} className="file-item uploaded">
                      <div className="file-info">
                        <FileText size={20} />
                        <p className="file-name">{file.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="ghost-btn" 
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button 
                className="primary-btn" 
                onClick={handleUploadFiles}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${selectedFiles.length} file(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-footer">
        <div className="chat-actions-row">
          <button 
            className="secondary-btn" 
            onClick={() => setShowUploadModal(true)}
            disabled={evidenceFiles.length >= 3}
          >
            <Paperclip size={16} />
            Attach evidence {evidenceFiles.length > 0 && `(${evidenceFiles.length})`}
          </button>
          {lastIssue && (
            <button type="button" className="ghost-btn" onClick={handleReset}>
              <RotateCcw size={16} />
              New complaint
            </button>
          )}
        </div>
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your reply here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            className="primary-btn"
            disabled={status === 'loading' || !input.trim()}
          >
            {status === 'loading' ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
