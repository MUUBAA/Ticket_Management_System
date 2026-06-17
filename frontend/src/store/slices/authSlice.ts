import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import {
  authService,
} from '../../services/authService';

import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../../types/user';

// =========================================
// AUTH STATE
// =========================================

interface AuthState {

  user: User | null;

  token: string | null;

  isAuthenticated: boolean;

  loading: boolean;

  error: string | null;

  hasBeenChecked: boolean;
}

// =========================================
// BASE INITIAL STATE
// =========================================

const baseInitialState:
AuthState = {

  user: null,

  token: null,

  isAuthenticated: false,

  loading: false,

  error: null,

  hasBeenChecked: true,
};

// =========================================
// LOAD AUTH STATE
// =========================================

const loadAuthState =
  (): AuthState => {

    try {

      const storedAuth =
        localStorage.getItem(
          'auth'
        );

      if (!storedAuth) {

        return baseInitialState;
      }

      const parsedAuth =
        JSON.parse(
          storedAuth
        ) as AuthState;

      // VALIDATE TOKEN

      if (
        parsedAuth.token
        &&
        parsedAuth.user
      ) {

        return {
          ...parsedAuth,

          isAuthenticated: true,
          hasBeenChecked: true,
        };
      }

      return baseInitialState;

    } catch {

      return baseInitialState;
    }
  };

// =========================================
// SAVE AUTH STATE
// =========================================

const saveAuthState = (
  state: AuthState
) => {

  try {

    localStorage.setItem(
      'auth',

      JSON.stringify({

        user:
          state.user,

        token:
          state.token,

        isAuthenticated:
          state.isAuthenticated,

        hasBeenChecked:
          state.hasBeenChecked,
      })
    );

  } catch (err) {

    console.error(
      'Failed to save auth state',
      err
    );
  }
};

// =========================================
// CLEAR AUTH STORAGE
// =========================================

const clearAuthStorage =
  () => {

    localStorage.removeItem(
      'auth'
    );
  };

// =========================================
// INITIAL STATE
// =========================================

const initialState:
AuthState =
  loadAuthState();

// =========================================
// LOGIN
// =========================================

export const login =
  createAsyncThunk<
    AuthResponse,
    LoginRequest
  >(
    'auth/login',

    async (
      credentials,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await authService.login(
            credentials
          );

        return response;

      } catch (error: any) {

        return rejectWithValue(
          error.message ||
          'Failed to login'
        );
      }
    }
  );

// =========================================
// REGISTER
// =========================================

export const register =
  createAsyncThunk<
    AuthResponse,
    RegisterRequest
  >(
    'auth/register',

    async (
      credentials,
      { rejectWithValue }
    ) => {

      try {

        const response =
          await authService.register(
            credentials
          );

        return response;

      } catch (error: any) {

        return rejectWithValue(
          error.message ||
          'Failed to register'
        );
      }
    }
  );

// =========================================
// FETCH CURRENT USER
// =========================================

export const fetchCurrentUser =
  createAsyncThunk<
    User,
    void
  >(
    'auth/fetchCurrentUser',

    async (
      _,
      { rejectWithValue }
    ) => {

      try {

        const user =
          await authService.getCurrentUser();

        return user;

      } catch (error: any) {

        return rejectWithValue(
          error.message ||
          'Failed to fetch user'
        );
      }
    }
  );

// =========================================
// AUTH SLICE
// =========================================

const authSlice =
  createSlice({

    name: 'auth',

    initialState,

    reducers: {

      // ===================================
      // LOGOUT
      // ===================================

      logout: (state) => {

        state.user = null;

        state.token = null;

        state.isAuthenticated =
          false;

        state.loading = false;

        state.error = null;

        state.hasBeenChecked =
          true;

        clearAuthStorage();
      },

      // ===================================
      // CLEAR ERROR
      // ===================================

      clearError: (state) => {

        state.error = null;
      },

      // ===================================
      // CLEAR AUTH
      // ===================================

      clearAuth: (state) => {

        state.user = null;

        state.token = null;

        state.isAuthenticated =
          false;

        state.loading = false;

        state.error = null;

        state.hasBeenChecked =
          true;

        clearAuthStorage();
      },
    },

    // =====================================
    // EXTRA REDUCERS
    // =====================================

    extraReducers: (builder) => {

      builder

        // ===============================
        // LOGIN
        // ===============================

        .addCase(
          login.pending,
          (state) => {

            state.loading = true;

            state.error = null;
          }
        )

        .addCase(
          login.fulfilled,
          (state, action) => {

            state.loading = false;

            state.token =
              action.payload.token;

            state.user =
              action.payload.user;

            state.isAuthenticated =
              true;

            state.hasBeenChecked =
              true;

            state.error = null;

            saveAuthState(state);
          }
        )

        .addCase(
          login.rejected,
          (state, action) => {

            state.loading = false;

            state.error =
              action.payload as string;

            state.hasBeenChecked =
              true;
          }
        )

        // ===============================
        // REGISTER
        // ===============================

        .addCase(
          register.pending,
          (state) => {

            state.loading = true;

            state.error = null;
          }
        )

        .addCase(
          register.fulfilled,
          (state, action) => {

            state.loading = false;

            state.token =
              action.payload.token;

            state.user =
              action.payload.user;

            state.isAuthenticated =
              true;

            state.hasBeenChecked =
              true;

            state.error = null;

            saveAuthState(state);
          }
        )

        .addCase(
          register.rejected,
          (state, action) => {

            state.loading = false;

            state.error =
              action.payload as string;

            state.hasBeenChecked =
              true;
          }
        )

        // ===============================
        // FETCH CURRENT USER
        // ===============================

        .addCase(
          fetchCurrentUser.pending,
          (state) => {

            state.loading = true;
          }
        )

        .addCase(
          fetchCurrentUser.fulfilled,
          (state, action) => {

            state.loading = false;

            state.user =
              action.payload;

            state.isAuthenticated =
              true;

            state.hasBeenChecked =
              true;

            saveAuthState(state);
          }
        )

        .addCase(
          fetchCurrentUser.rejected,
          (state, action) => {

            state.loading = false;

            state.error =
              action.payload as string;

            state.hasBeenChecked =
              true;

            // ALWAYS LOGOUT ON ANY ERROR FROM FETCH CURRENT USER
            // This means token is invalid or expired
            state.user = null;

            state.token = null;

            state.isAuthenticated =
              false;

            clearAuthStorage();
          }
        );
    },
  });

// =========================================
// EXPORTS
// =========================================

export const {

  logout,

  clearError,

  clearAuth,

} = authSlice.actions;

export default authSlice.reducer;