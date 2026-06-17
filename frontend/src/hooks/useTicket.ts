import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTickets,
  fetchTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  setFilters,
  clearError,
  clearCurrentTicket,
} from '../store/slices/ticketSlice';
import { RootState, AppDispatch } from '../store';
import { Ticket, UpdateTicketInput, CreateTicketInput } from '../types/ticket';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector;

export const useTicket = () => {
  const dispatch = useAppDispatch();
  const { tickets, loading, error, pagination, currentTicket } = useSelector(
    (state: RootState) => state.tickets
  );

  const fetchTicketsAction = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      status?: string;
      priority?: string;
      search?: string;
      ticketId?: number;
      companyName?: string;
      assignedTo?: number;
      customerName?: string;
      fromDate?: string;
      toDate?: string;
      sortBy?: string;

      sortOrder?: "ASC" | "DESC";
    }) => {
      if (params) {
        await dispatch(fetchTickets(params));
      } else {
        await dispatch(fetchTickets({}));
      }
    },
    [dispatch]
  );

  const fetchTicketByIdAction = useCallback(
    async (id: number) => {
      await dispatch(fetchTicketById(id));
    },
    [dispatch]
  );

  const createTicketAction = useCallback(
    async (data: CreateTicketInput): Promise<Ticket> => {
      const result = await dispatch(createTicket(data));
      if (createTicket.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
      return result.payload;
    },
    [dispatch]
  );

  const updateTicketAction = useCallback(
    async (id: number, data: UpdateTicketInput) => {
      await dispatch(updateTicket({ id, data }));
    },
    [dispatch]
  );

  const deleteTicketAction = useCallback(
    async (id: number) => {
      await dispatch(deleteTicket(id));
    },
    [dispatch]
  );

  const setFiltersAction = useCallback(
    async (filters: { status?: string; priority?: string; search?: string; assignedTo?: number }) => {
      await dispatch(setFilters(filters));
    },
    [dispatch]
  );

  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentTicketAction = useCallback(() => {
    dispatch(clearCurrentTicket());
  }, [dispatch]);

  return {
    tickets,
    loading,
    error,
    pagination,
    currentTicket,
    fetchTickets: fetchTicketsAction,
    fetchTicketById: fetchTicketByIdAction,
    createTicket: createTicketAction,
    updateTicket: updateTicketAction,
    deleteTicket: deleteTicketAction,
    setFilters: setFiltersAction,
    clearError: clearErrorAction,
    clearCurrentTicket: clearCurrentTicketAction,
  };
};

export const useTickets = (): Ticket[] => {
  return useAppSelector((state: RootState) => state.tickets.tickets);
};

export const useTicketLoading = (): boolean => {
  return useAppSelector((state: RootState) => state.tickets.loading);
};

export const useTicketError = (): string | null => {
  return useAppSelector((state: RootState) => state.tickets.error);
};

export const useTicketPagination = () => {
  return useAppSelector((state: RootState) => state.tickets.pagination);
};
