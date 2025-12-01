import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addUserMessage,
  captureAnswer,
  nextStep,
  resetChat,
  steps,
  submitIssue,
  uploadEvidence,
  removeEvidenceFile,
} from './chatSlice';
import { fetchMyIssues } from '@/features/issues/issuesSlice';
import { MessageSquare, Send, Paperclip, RotateCcw, Loader2, User, Bot, X, FileText, Image, Film, FileUp } from 'lucide-react';
import Toast from '@/components/Toast';
import LocationPicker from '@/components/LocationPicker';
import '@/styles/ChatPage.css';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { messages, stepIndex, issueData, lastIssue, status } =
    useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]); // Store files in component state
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [mapLocation, setMapLocation] = useState(() => issueData?.geoLocation || null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (issueData?.geoLocation) {
      const { latitude, longitude } = issueData.geoLocation;
      if (
        !mapLocation ||
        mapLocation.latitude !== latitude ||
        mapLocation.longitude !== longitude
      ) {
        setMapLocation(issueData.geoLocation);
      }
    }
  }, [issueData?.geoLocation, mapLocation]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    await handleAnswer(text);
  };

  const handleChoiceClick = async (choice) => {
    await handleAnswer(choice);
  };

  const handleAnswer = async (text) => {
    const currentStep = steps[stepIndex];
    
    if (currentStep) {
      let value = text;
      
      // Validate severity input (if manually typed)
      if (currentStep.key === 'severity') {
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        if (!validSeverities.includes(text.toLowerCase())) {
          dispatch(addUserMessage(text));
          dispatch({
            type: 'chat/addSystemMessage',
            payload: `Sorry, "${text}" is not a valid severity level. Please choose one of the options above.`,
          });
          setInput('');
          return;
        }
        value = text.toLowerCase();
      }
      
      // Validate recurrence input (if manually typed)
      if (currentStep.key === 'recurrence') {
        const validRecurrences = ['new', 'recurring', 'ongoing'];
        if (!validRecurrences.includes(text.toLowerCase())) {
          dispatch(addUserMessage(text));
          dispatch({
            type: 'chat/addSystemMessage',
            payload: `Sorry, "${text}" is not a valid option. Please choose one of the options above.`,
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
        // Final step - upload files first if any, then submit
        setUploading(true);
        try {
          let evidenceUrls = [];
          
          // Upload pending files if any
          if (pendingFiles.length > 0) {
            const formData = new FormData();
            pendingFiles.forEach(file => {
              formData.append('files', file);
            });
            
            const uploadRes = await dispatch(uploadEvidence(pendingFiles)).unwrap();
            evidenceUrls = uploadRes.files.map(f => f.url);
          }
          
          const payload = {
            ...issueData,
            [currentStep.key]: value,
            evidenceUrls,
          };
          if (mapLocation?.latitude && mapLocation?.longitude) {
            payload.geoLocation = mapLocation;
          }
          
          await dispatch(submitIssue(payload)).unwrap();
          // Show success toast
          setShowToast(true);
          setPendingFiles([]); // Clear pending files
          // Refresh the citizen's complaints list after successful submission
          if (user && user.role === 'citizen') {
            dispatch(fetchMyIssues());
          }
        } catch (err) {
          // Error already handled in the slice
        } finally {
          setUploading(false);
        }
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    // Check maximum 3 files
    if (pendingFiles.length + files.length > 3) {
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
    if (validFiles.length > 0) {
      setPendingFiles([...pendingFiles, ...validFiles]);
      setShowUploadModal(false);
    }
  };

  const removeFile = (index) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== index));
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleReset = () => {
    dispatch(resetChat());
    setPendingFiles([]);
    setUploadErrors([]);
    setMapLocation(null);
    setLocationConfirmed(false);
  };

  const handleMapLocationChange = useCallback(
    (coords) => {
      setMapLocation(coords);
      setLocationConfirmed(false); // Reset confirmation when location changes
      dispatch(captureAnswer({ key: 'geoLocation', value: coords }));
    },
    [dispatch]
  );

  const handleConfirmLocation = () => {
    if (mapLocation?.latitude && mapLocation?.longitude) {
      setLocationConfirmed(true);
      const locationText = mapLocation.address || `${mapLocation.latitude.toFixed(6)}, ${mapLocation.longitude.toFixed(6)}`;
      handleAnswer(locationText);
    }
  };

  const getChoiceOptions = () => {
    const currentStep = steps[stepIndex];
    if (!currentStep) return null;

    if (currentStep.key === 'severity') {
      return [
        { value: 'low', label: 'Low', icon: '🔵', description: 'Minor issue' },
        { value: 'medium', label: 'Medium', icon: '🟡', description: 'Moderate concern' },
        { value: 'high', label: 'High', icon: '🟠', description: 'Serious problem' },
        { value: 'critical', label: 'Critical', icon: '🔴', description: 'Urgent attention needed' },
      ];
    }

    if (currentStep.key === 'recurrence') {
      return [
        { value: 'new', label: 'New', icon: '✨', description: 'First time noticing' },
        { value: 'recurring', label: 'Recurring', icon: '🔄', description: 'Happened before' },
        { value: 'ongoing', label: 'Ongoing', icon: '⏳', description: 'Continuous problem' },
      ];
    }

    return null;
  };

  const choiceOptions = getChoiceOptions();
  const isLocationStep = steps[stepIndex]?.key === 'location';

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

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-bubble-wrapper ${m.from === 'user' ? 'align-right' : 'align-left'} fade-scale`}
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

        {/* Show map inline during location step */}
        {(isLocationStep || (mapLocation && lastIssue)) && (
          <div className="chat-map-inline">
            <LocationPicker
              value={mapLocation}
              onChange={lastIssue ? undefined : handleMapLocationChange}
              readOnly={Boolean(lastIssue)}
              helperText={lastIssue ? 'Location shared with the assigned officials.' : 'Search for the spot, drop a pin, or use your current location for faster resolution.'}
              label="Pin the issue location"
              height={280}
              showLocateButton={!lastIssue}
            />
            {!lastIssue && isLocationStep && mapLocation && !locationConfirmed && (
              <div className="location-confirm-wrapper">
                <button 
                  className="location-confirm-btn primary-btn"
                  onClick={handleConfirmLocation}
                >
                  <Send size={16} />
                  Confirm Location & Continue
                </button>
              </div>
            )}
            {!lastIssue && (
              <p className="chat-map-note">Admins and department officials can see any searched addresses, pinned spots, and shared coordinates.</p>
            )}
          </div>
        )}

        {/* Show choice buttons when applicable */}
        {choiceOptions && status !== 'loading' && !lastIssue && (
          <div className="chat-choices">
            {choiceOptions.map((option) => (
              <button
                key={option.value}
                className={`choice-btn ${steps[stepIndex]?.key === 'severity' ? `severity-${option.value}` : ''}`}
                onClick={() => handleChoiceClick(option.value)}
              >
                <span className="choice-icon">{option.icon}</span>
                <div className="choice-content">
                  <span className="choice-label">{option.label}</span>
                  <span className="choice-description">{option.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}
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
                <label className={`file-upload-label ${pendingFiles.length >= 3 ? 'disabled' : ''}`}>
                  <FileUp size={32} />
                  <span>
                    {pendingFiles.length >= 3 
                      ? 'Maximum 3 files reached. Remove files to add new ones.' 
                      : 'Click to select files'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.mp4"
                    onChange={handleFileSelect}
                    disabled={pendingFiles.length >= 3}
                  />
                </label>
              </div>

              {pendingFiles.length > 0 && (
                <div className="selected-files-list">
                  <h4>Attached Files ({pendingFiles.length}/3)</h4>
                  <p className="upload-info">Files will be uploaded when you complete the chat</p>
                  {pendingFiles.map((file, index) => (
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
            </div>
            <div className="modal-footer">
              <button 
                className="primary-btn" 
                onClick={() => setShowUploadModal(false)}
              >
                Done
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
          >
            <Paperclip size={16} />
            Attach Evidence {pendingFiles.length > 0 && `(${pendingFiles.length})`}
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
            placeholder={
              isLocationStep && !locationConfirmed 
                ? "Use the map above to mark location, then click 'Confirm Location'" 
                : "Type your reply here..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status === 'loading' || (isLocationStep && !locationConfirmed)}
          />
          <button
            type="submit"
            className="primary-btn"
            disabled={status === 'loading' || !input.trim() || (isLocationStep && !locationConfirmed)}
          >
            {status === 'loading' ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>

      {showToast && (
        <Toast 
          message="Submitted Successfully!" 
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;
