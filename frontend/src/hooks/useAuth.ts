import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { useCallback } from 'react';
import {
  login,
  register,
  fetchCurrentUser,
  logout,
  clearError,
  clearAuth,
} from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';
import { User, RegisterRequest } from '../types/user';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error, hasBeenChecked } = useSelector(
    (state: RootState) => state.auth
  );

  const loginAction = useCallback(
    async (credentials: { email: string; password: string }) => {
      await dispatch(login(credentials));
    },
    [dispatch]
  );

  const registerAction = useCallback(
    async (data: RegisterRequest) => {
      await dispatch(register(data));
    },
    [dispatch]
  );

  const logoutAction = useCallback(async () => {
    await dispatch(logout());
  }, [dispatch]);

  const fetchUser = useCallback(async () => {
    await dispatch(fetchCurrentUser());
  }, [dispatch]);

  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearAuthAction = useCallback(() => {
    dispatch(clearAuth());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    hasBeenChecked,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    fetchUser,
    clearError: clearErrorAction,
    clearAuth: clearAuthAction,
  };
};

export const useUser = (): User | null => {
  return useAppSelector((state: RootState) => state.auth.user);
};

export const useIsAuthenticated = (): boolean => {
  return useAppSelector((state: RootState) => state.auth.isAuthenticated);
};

export const useAuthLoading = (): boolean => {
  return useAppSelector((state: RootState) => state.auth.loading);
};

export const useAuthError = (): string | null => {
  return useAppSelector((state: RootState) => state.auth.error);
};
