import api from "./api";
import {
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketListResponse,
} from "../types/ticket";

// Helper to transform date string to ISO timestamp
const transformDateToISO = (dateString?: string): string | undefined => {
  if (!dateString) return undefined;
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch {
    return dateString;
  }
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const ticketService = {
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    ticketType?: string;
    priority?: string;
    search?: string;
    ticketId?: number;
    assignedTo?: number;
    customerName?: string;
    projectName?: string;
    companyName?: string;
    fromDate?: string;

    toDate?: string;

    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<TicketListResponse> {
    const queryParams: Record<string, string | number> = {};

    // =====================================
    // PAGINATION
    // =====================================

    if (params?.page !== undefined) {
      queryParams.page = params.page;
    }

    if (params?.limit !== undefined) {
      queryParams.pageSize = params.limit;
    }

    // =====================================
    // FILTERS
    // =====================================

    if (params?.status) {
      queryParams.status = params.status;
    }

    if (params?.ticketType) {
      queryParams.ticketType = params.ticketType;
    }

    if (params?.priority) {
      queryParams.priority = params.priority;
    }

    if (params?.search) {
      queryParams.search = params.search;
    }

    // =====================================
    // TICKET ID FILTER
    // =====================================

    if (params?.ticketId !== undefined) {
      queryParams.ticketId = params.ticketId;
    }

    // =====================================
    // CUSTOMER NAME FILTER
    // =====================================

    if (params?.customerName) {
      queryParams.customerName = params.customerName;
    }

    // =====================================
    // PROJECT NAME FILTER
    // =====================================

    if (params?.projectName) {
      queryParams.projectName = params.projectName;
    }

    // =====================================
    // COMPANY NAME FILTER
    // =====================================

    if (params?.companyName) {
      queryParams.companyName = params.companyName;
    }

    // =====================================
    // ASSIGNED TO FILTER
    // =====================================

    if (params?.assignedTo) {
      queryParams.assignedTo = params.assignedTo;
    }

    // =====================================
    // SORTING
    // =====================================

    if (params?.sortBy) {
      queryParams.sortBy = params.sortBy;
    }

    if (params?.sortOrder) {
      queryParams.sortOrder = params.sortOrder;
    }

    // =====================================
    // FROM DATE FILTER
    // =====================================

    if (params?.fromDate) {
      queryParams.fromDate = params.fromDate;
    }

    // =====================================
    // TO DATE FILTER
    // =====================================

    if (params?.toDate) {
      queryParams.toDate = params.toDate;
    }

    // =====================================
    // API CALL
    // =====================================

    const response = await api.get<TicketListResponse>("/tickets", queryParams);

    return response;
  },

  async getTicketById(id: number): Promise<Ticket> {
    const response = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data;
  },

  async createTicket(data: CreateTicketInput): Promise<Ticket> {
    // Transform the data to match backend expectations
    const transformedData = {
      ...data,
      due_date: transformDateToISO(data.due_date),
    };
    const response = await api.post<ApiResponse<Ticket>>(
      "/tickets",
      transformedData,
    );
    return response.data;
  },

  async updateTicket(id: number, data: UpdateTicketInput): Promise<Ticket> {
    // Transform the data to match backend expectations
    const transformedData = {
      ...data,
      due_date: transformDateToISO(data.due_date),
    };
    const response = await api.put<ApiResponse<Ticket>>(
      `/tickets/${id}`,
      transformedData,
    );
    return response.data;
  },

  async deleteTicket(id: number): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },

  async exportTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    ticketType?: string;
    ticketId?: number;
    companyName?: string;
    customerName?: string;
    projectName?: string;
    assignedTo?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<Blob> {
    const queryParams: Record<string, string | number> = {};

    if (params?.page !== undefined) {
      queryParams.page = params.page;
    }

    if (params?.limit !== undefined) {
      queryParams.pageSize = params.limit;
    }

    if (params?.status) {
      queryParams.status = params.status;
    }

    if (params?.priority) {
      queryParams.priority = params.priority;
    }

    if (params?.ticketType) {
      queryParams.ticketType = params.ticketType;
    }

    if (params?.ticketId !== undefined) {
      queryParams.ticketId = params.ticketId;
    }

    if (params?.customerName) {
      queryParams.customerName = params.customerName;
    }

    if (params?.companyName) {
      queryParams.companyName = params.companyName;
    }

    if (params?.projectName) {
      queryParams.projectName = params.projectName;
    }

    if (params?.assignedTo !== undefined) {
      queryParams.assignedTo = params.assignedTo;
    }

    if (params?.search) {
      queryParams.search = params.search;
    }

    if (params?.fromDate) {
      queryParams.fromDate = params.fromDate;
    }

    if (params?.toDate) {
      queryParams.toDate = params.toDate;
    }

    if (params?.sortBy) {
      queryParams.sortBy = params.sortBy;
    }

    if (params?.sortOrder) {
      queryParams.sortOrder = params.sortOrder;
    }

    return api.get<Blob>("/tickets/export", queryParams, "blob");
  },
};
