import api from './api';

import {
  User,
  UserListResponse,
  UpdateUserRequest,
} from '../types/user';

// =====================================
// COMMON API RESPONSE
// =====================================

interface ApiResponse<T> {

  success: boolean;

  data: T;
}

// =====================================
// USER SERVICE
// =====================================

export const userService = {

  // ===================================
  // GET USERS
  // ===================================

  async getUsers(
    params?: {
      page?: number;
      pageSize?: number;
      search?: string;
    }
  ): Promise<UserListResponse> {

    const response =
      await api.get<
        ApiResponse<UserListResponse>
      >(
        '/users',
        params
      );

    return response.data;
  },

  // ===================================
  // GET USER BY ID
  // ===================================

  async getUserById(
    id: number
  ): Promise<User> {

    const response =
      await api.get<
        ApiResponse<User>
      >(
        `/users/${id}`
      );

    return response.data;
  },

  async getCompanyUsers(): Promise<User[]> {

  const response =
    await api.get<{
      success: boolean;

      data: User[];
    }>(
      "/users/company-users",
    );

  return response.data;
},

  // ===================================
  // UPDATE USER
  // ===================================

  async updateUser(
    id: number,
    data: UpdateUserRequest
  ): Promise<User> {

    const response =
      await api.put<
        ApiResponse<User>
      >(
        `/users/${id}`,
        data
      );

    return response.data;
  },
};

