import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://164.52.217.188:8082/api';

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ForgotPasswordService {
  /**
   * Request password reset email
   */
  static async forgotPassword(email: string): Promise<ApiResponse<null>> {
    try {
      const response = await axios.post<ApiResponse<null>>(
        `${API_BASE_URL}/auth/forgot-password`,
        { email } as ForgotPasswordRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { code: 'ERROR', message: 'Failed to request password reset' } };
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      const response = await axios.post<ApiResponse<null>>(
        `${API_BASE_URL}/auth/reset-password`,
        { token, newPassword } as ResetPasswordRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: { code: 'ERROR', message: 'Failed to reset password' } };
    }
  }
}

export default ForgotPasswordService;
