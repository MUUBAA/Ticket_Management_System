import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ticketService } from "../../services/ticketService";
import {
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketListResponse,
} from "../../types/ticket";

export interface TicketStats {
  totalItems: number;

  openCount: number;

  closedCount: number;

  onHoldCount: number;

  inProgressCount: number;

  criticalCount: number;

  highCount: number;

  mediumCount: number;

  lowCount: number;
}

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalItems: number;
    limit: number;
    totalPages: number;
  };
  stats: TicketStats;

  filters: {
    status: string;
    priority: string;
    search: string;
  };
}

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  },
  stats: {
    totalItems: 0,

    openCount: 0,

    closedCount: 0,

    onHoldCount: 0,

    inProgressCount: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
  },
  filters: {
    status: "",
    priority: "",
    search: "",
  },
};

export const fetchTickets = createAsyncThunk<
  TicketListResponse,
  {
    page?: number;

    limit?: number;

    status?: string;

    ticketType?: string;

    priority?: string;

    search?: string;

    ticketId?: number;

    customerName?: string;

    projectName?: string;

    companyName?: string;

    fromDate?: string;

    toDate?: string;

    sortBy?: string;

    sortOrder?: "ASC" | "DESC";
  }
>("tickets/fetchTickets", async (params, { rejectWithValue }) => {
  try {
    const response = await ticketService.getTickets(params);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch tickets");
  }
});

export const fetchTicketById = createAsyncThunk<Ticket, number>(
  "tickets/fetchTicketById",
  async (id, { rejectWithValue }) => {
    try {
      const ticket = await ticketService.getTicketById(id);
      return ticket;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch ticket");
    }
  },
);

export const createTicket = createAsyncThunk<Ticket, CreateTicketInput>(
  "tickets/createTicket",
  async (data, { rejectWithValue }) => {
    try {
      const ticket = await ticketService.createTicket(data);
      return ticket;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create ticket");
    }
  },
);

export const updateTicket = createAsyncThunk<
  Ticket,
  { id: number; data: UpdateTicketInput }
>("tickets/updateTicket", async ({ id, data }, { rejectWithValue }) => {
  try {
    const ticket = await ticketService.updateTicket(id, data);
    return ticket;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update ticket");
  }
});

export const deleteTicket = createAsyncThunk<number, number>(
  "tickets/deleteTicket",
  async (id, { rejectWithValue }) => {
    try {
      await ticketService.deleteTicket(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete ticket");
    }
  },
);

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<{
        status?: string;
        priority?: string;
        search?: string;
      }>,
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.data?.tickets || [];
        state.pagination = {
          page: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.pageSize || 10,
          totalItems: action.payload.data?.pagination?.totalItems || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
        };
        state.stats = action.payload.data?.stats || {
          totalItems: 0,

          openCount: 0,

          closedCount: 0,

          onHoldCount: 0,

          inProgressCount: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
        };
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Ticket By ID
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
        state.currentTicket = action.payload;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Ticket
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(
          (t) => t.ticketId === action.payload.ticketId,
        );
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket?.ticketId === action.payload.ticketId) {
          state.currentTicket = action.payload;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Ticket
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = state.tickets.filter(
          (t) => t.ticketId !== action.payload,
        );
        if (state.currentTicket?.ticketId === action.payload) {
          state.currentTicket = null;
        }
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearError, clearCurrentTicket } =
  ticketSlice.actions;
export default ticketSlice.reducer;
