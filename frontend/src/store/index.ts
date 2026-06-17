import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ticketReducer from './slices/ticketSlice';
import userReducer from './slices/userSlice';
import commentReducer from './slices/commentSlice';
import { Middleware } from '@reduxjs/toolkit';

// Middleware to persist auth state to localStorage
const authPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  
  // Only persist auth state
  if (state.auth) {
    localStorage.setItem('auth', JSON.stringify(state.auth));
  }
  
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
    users: userReducer,
    comments: commentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['FETCH_CURRENT_USER_PENDING', 'FETCH_CURRENT_USER_FULFILLED'],
      },
    }).concat(authPersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
