import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { userService } from "../../services/userservice";

import { User, UserListResponse, UpdateUserRequest } from "../../types/user";

// =========================================
// STATE INTERFACE
// =========================================

interface UserState {
  users: User[];

  currentUser: User | null;

  companyUsers: User[];

  loading: boolean;

  error: string | null;

  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  filters: {
    search: string;
  };
}

// =========================================
// INITIAL STATE
// =========================================

const initialState: UserState = {
  users: [],

  companyUsers: [],

  currentUser: null,

  loading: false,

  error: null,

  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },

  filters: {
    search: "",
  },
};

// =========================================
// FETCH USERS
// =========================================

export const fetchUsers = createAsyncThunk<
  UserListResponse,
  {
    page?: number;
    pageSize?: number;
    search?: string;
  }
>(
  "users/fetchUsers",

  async (params, { rejectWithValue }) => {
    try {
      return await userService.getUsers(params);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch users");
    }
  },
);

// =========================================
// FETCH USER BY ID
// =========================================

export const fetchUserById = createAsyncThunk<User, number>(
  "users/fetchUserById",

  async (id, { rejectWithValue }) => {
    try {
      return await userService.getUserById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch user");
    }
  },
);

// =========================================
// UPDATE USER
// =========================================

export const updateUser = createAsyncThunk<
  User,
  {
    id: number;
    data: UpdateUserRequest;
  }
>(
  "users/updateUser",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update user");
    }
  },
);

// =========================================
// FETCH COMPANY USERS
// =========================================

export const fetchCompanyUsers = createAsyncThunk<User[]>(
  "users/fetchCompanyUsers",

  async (_, { rejectWithValue }) => {
    try {
      return await userService.getCompanyUsers();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch company users");
    }
  },
);

// =========================================
// SLICE
// =========================================

const userSlice = createSlice({
  name: "users",

  initialState,

  reducers: {
    // =====================================
    // SET SEARCH
    // =====================================

    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },

    // =====================================
    // CLEAR ERROR
    // =====================================

    clearError: (state) => {
      state.error = null;
    },

    // =====================================
    // CLEAR CURRENT USER
    // =====================================

    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },

  // =======================================
  // EXTRA REDUCERS
  // =======================================

  extraReducers: (builder) => {
    builder

      // ===================================
      // FETCH USERS
      // ===================================

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;

        state.users = action.payload.users;

        state.pagination = action.payload.pagination;
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload as string;
      })

      // ===================================
      // FETCH USER BY ID
      // ===================================

      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;

        state.currentUser = action.payload;
      })

      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload as string;
      })

      // ===================================
      // FETCH COMPANY USERS
      // ===================================

      .addCase(fetchCompanyUsers.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchCompanyUsers.fulfilled, (state, action) => {
        state.loading = false;

        state.companyUsers = action.payload;
      })

      .addCase(fetchCompanyUsers.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload as string;
      })

      // ===================================
      // UPDATE USER
      // ===================================

      .addCase(updateUser.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;

        state.currentUser = action.payload;

        // UPDATE USER LIST

        const index = state.users.findIndex(
          (user) => user.userId === action.payload.userId,
        );

        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })

      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload as string;
      });
  },
});

// =========================================
// EXPORT ACTIONS
// =========================================

export const {
  setSearch,

  clearError,

  clearCurrentUser,
} = userSlice.actions;

// =========================================
// EXPORT REDUCER
// =========================================

export default userSlice.reducer;
