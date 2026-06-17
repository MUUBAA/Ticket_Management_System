import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  useEffect,
} from 'react';

import {
  useAuth,
  useAppDispatch,
} from './hooks/useAuth';

import {
  fetchCurrentUser,
  logout,
} from './store/slices/authSlice';

import Layout from './components/Layout';

import Login from './pages/Login';

import Register from './pages/Register';

import ForgotPassword from './pages/ForgotPassword/ForgotPassword';

import ResetPassword from './pages/ResetPassword/ResetPassword';

import Dashboard from './pages/Dashboard';

import Tickets from './pages/Tickets';

import TicketDetail
  from './pages/Tickets/TicketDetail';

import CreateTicket
  from './pages/CreateTicket';

import Reports
  from './pages/Reports/Reports';

import './App.css';

function App() {

  const dispatch =
    useAppDispatch();

  const {
    isAuthenticated,
    loading,
    hasBeenChecked,
  } = useAuth();

  // =====================================
  // INITIAL AUTH CHECK
  // =====================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        'auth_token'
      );

    // ONLY FETCH USER
    // IF TOKEN EXISTS
    // AND NOT ALREADY CHECKED

    if (token && !hasBeenChecked) {

      dispatch(
        fetchCurrentUser()
      );
    }

  }, [dispatch, hasBeenChecked]);

  // =====================================
  // LISTEN FOR TOKEN EXPIRATION
  // =====================================

  useEffect(() => {

    const handleTokenExpired = () => {
      dispatch(logout());
    };

    window.addEventListener(
      'token-expired',
      handleTokenExpired
    );

    return () => {
      window.removeEventListener(
        'token-expired',
        handleTokenExpired
      );
    };

  }, [dispatch]);

  // =====================================
  // LOADING SCREEN
  // =====================================

  if (
    loading ||
    !hasBeenChecked
  ) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="flex flex-col items-center gap-4">

          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-gray-600 text-sm font-medium">
            Loading...
          </p>

        </div>

      </div>
    );
  }

  // =====================================
  // ROUTES
  // =====================================

  return (

    <Router>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={
            !isAuthenticated
              ? <Login />
              : <Navigate to="/" />
          }
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={
            !isAuthenticated
              ? <Register />
              : <Navigate to="/" />
          }
        />

        {/* FORGOT PASSWORD */}

        <Route
          path="/forgot-password"
          element={
            !isAuthenticated
              ? <ForgotPassword />
              : <Navigate to="/" />
          }
        />

        {/* RESET PASSWORD */}

        <Route
          path="/reset-password"
          element={
            !isAuthenticated
              ? <ResetPassword />
              : <Navigate to="/" />
          }
        />

        {/* PROTECTED ROUTES */}

        <Route
          path="/"
          element={
            isAuthenticated
              ? <Layout />
              : <Navigate to="/login" />
          }
        >

          {/* DASHBOARD */}

          <Route
            index
            element={<Dashboard />}
          />

          {/* TICKETS */}

          <Route
            path="tickets"
            element={<Tickets />}
          />

          {/* TICKET DETAIL */}

          <Route
            path="tickets/:id"
            element={<TicketDetail />}
          />

          {/* CREATE TICKET */}

          <Route
            path="tickets/create"
            element={<CreateTicket />}
          />

          {/* REPORTS */}

          <Route
            path="reports"
            element={<Reports />}
          />

        </Route>

      </Routes>

    </Router>
  );
}

export default App;