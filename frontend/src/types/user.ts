export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface User {

  userId: number;

  name: string;

  companyName?: string;

  empId?: string;

  email: string;

  designation?: string;

  reportTo?: number;

  reportToName?: string;

  role?: string;

  createdBy?: number;

  createdOn: string;

  updatedBy?: number;

  updatedOn: string;

  traceId: string;

  totalTickets: number;

  openCount: number;

  inProgressCount: number;

  onHoldCount: number;

  closedCount: number;
}

export interface UserListResponse {

  users: User[];

  pagination: Pagination;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  designation?: string;
  empId?: string;
  reportTo?: number | null;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: User;
}

export interface UpdateUserRequest {

  name?: string;

  companyName?: string;

  empId?: string;

  email?: string;

  designation?: string;

  reportTo?: number | null;
}
