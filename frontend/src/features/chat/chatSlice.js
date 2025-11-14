
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/apiClient';

export const submitIssue = createAsyncThunk(
  'chat/submitIssue',
  async (payload, thunkAPI) => {
    try {
      const res = await api.post('/issues', payload);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to submit issue'
      );
    }
  }
);

export const uploadEvidence = createAsyncThunk(
  'chat/uploadEvidence',
  async (files, thunkAPI) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      const res = await api.post('/uploads/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Upload failed'
      );
    }
  }
);

const steps = [
  { key: 'issueType', prompt: 'What type of issue are you reporting?' },
  { key: 'location', prompt: 'Where is this happening? Drop a map pin or share the address/landmark.' },
  { key: 'landmark', prompt: 'Any nearby landmark? (You can type "skip" to continue.)' },
  { key: 'severity', prompt: 'How severe is it? (low, medium, high, critical)' },
  { key: 'description', prompt: 'Describe what you see in your own words.' },
  { key: 'impact', prompt: 'What is the impact on people, traffic, or safety?' },
  { key: 'recurrence', prompt: 'Is this new, recurring, or ongoing?' },
  { key: 'contactName', prompt: 'Your name for follow-up? (or type "skip")' },
  { key: 'contactPhone', prompt: 'Phone number? (or type "skip")' },
  { key: 'contactEmail', prompt: 'Email address? (or type "skip")' },
];

const initialMessages = [
  {
    from: 'system',
    text: 'Hi! I will help you file a civic complaint. Let’s capture a few quick details.',
  },
  { from: 'system', text: steps[0].prompt },
];

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: initialMessages,
    stepIndex: 0,
    issueData: {},
    evidenceUrls: [],
    evidenceFiles: [], // Store file details
    lastIssue: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({ from: 'user', text: action.payload });
    },
    addSystemMessage(state, action) {
      state.messages.push({ from: 'system', text: action.payload });
    },
    captureAnswer(state, action) {
      const { key, value } = action.payload;
      state.issueData[key] = value;
    },
    nextStep(state) {
      state.stepIndex += 1;
      if (state.stepIndex < steps.length) {
        state.messages.push({
          from: 'system',
          text: steps[state.stepIndex].prompt,
        });
      }
    },
    resetChat(state) {
      state.messages = initialMessages;
      state.stepIndex = 0;
      state.issueData = {};
      state.evidenceUrls = [];
      state.evidenceFiles = [];
      state.lastIssue = null;
      state.status = 'idle';
      state.error = null;
    },
    addEvidenceUrl(state, action) {
      state.evidenceUrls.push(action.payload);
    },
    removeEvidenceFile(state, action) {
      const index = action.payload;
      state.evidenceUrls.splice(index, 1);
      state.evidenceFiles.splice(index, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitIssue.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitIssue.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastIssue = action.payload;
        state.messages.push({
          from: 'system',
          text: `Thank you! Your complaint has been filed as ${action.payload.issueId}.`,
        });
        state.messages.push({
          from: 'system',
          text: action.payload.issue.summary || 'A summary has been generated for the admin.',
        });
      })
      .addCase(submitIssue.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.messages.push({
          from: 'system',
          text: 'Something went wrong while submitting. Please try again.',
        });
      })
      .addCase(uploadEvidence.fulfilled, (state, action) => {
        const files = action.payload.files;
        files.forEach(file => {
          state.evidenceUrls.push(file.url);
          state.evidenceFiles.push(file);
        });
        state.messages.push({
          from: 'system',
          text: `${files.length} file(s) attached successfully. You can continue describing the issue.`,
        });
      })
      .addCase(uploadEvidence.rejected, (state, action) => {
        state.messages.push({
          from: 'system',
          text: `Upload failed: ${action.payload || 'Please try again'}`,
        });
      });
  },
});

export const {
  addUserMessage,
  addSystemMessage,
  captureAnswer,
  nextStep,
  resetChat,
  addEvidenceUrl,
  removeEvidenceFile,
} = chatSlice.actions;

export { steps };
export default chatSlice.reducer;
