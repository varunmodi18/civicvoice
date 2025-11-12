
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import chatReducer from '@/features/chat/chatSlice';
import issuesReducer from '@/features/issues/issuesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    issues: issuesReducer,
  },
});

export default store;
