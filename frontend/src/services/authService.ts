import api from './api';

import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../types/user';

// =========================================
// TOKEN STORAGE KEY
// =========================================

const TOKEN_KEY =
  'auth_token';

// =========================================
// AUTH SERVICE
// =========================================

export const authService = {

  // =========================================
  // LOGIN
  // =========================================

  async login(
    credentials: LoginRequest
  ): Promise<AuthResponse> {

    const response =
      await api.post<AuthResponse>(
        '/auth/login',
        credentials
      );

    // SAVE TOKEN

    if (response?.token) {

      localStorage.setItem(
        TOKEN_KEY,
        response.token
      );
    }

    return response;
  },

  // =========================================
  // REGISTER
  // =========================================

  async register(
    credentials: RegisterRequest
  ): Promise<AuthResponse> {

    const response =
      await api.post<AuthResponse>(
        '/auth/register',
        credentials
      );

    // SAVE TOKEN

    if (response?.token) {

      localStorage.setItem(
        TOKEN_KEY,
        response.token
      );
    }

     localStorage.setItem(
    'auth',
    JSON.stringify({
      token: response.token,
      user: response.user,
      isAuthenticated: true,
      hasBeenChecked: true,
    })
  );

    return response;
  },

  // =========================================
  // GET CURRENT USER
  // =========================================

  async getCurrentUser():
Promise<User> {

  const token =
    localStorage.getItem(
      TOKEN_KEY
    );

  if (!token) {

    throw new Error(
      'No token available'
    );
  }

  try {

    const response =
      await api.get<{
        success: boolean;
        data: User;
      }>(
        '/auth/profile'
      );

    // RETURN USER DATA

    return response.data;

  } catch (error: any) {

    // TOKEN INVALID

    this.logout();

    throw new Error(
      'Session expired. Please login again.'
    );
  }
},

  // =========================================
  // LOGOUT
  // =========================================

  logout(): void {

  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    'auth'
  );
},

isAuthenticated():
boolean {

  return !!localStorage.getItem(
    TOKEN_KEY
  );
},
  // =========================================
  // GET TOKEN
  // =========================================

  getToken():
  string | null {

    return localStorage.getItem(
      TOKEN_KEY
    );
  },
};