import { useState, useEffect, useRef } from 'react';

import {
  useNavigate,
  Link,
} from 'react-router-dom';

import { FiEye, FiEyeOff } from 'react-icons/fi';

import { useAuth }
  from '../../hooks/useAuth';

import Button
  from '../../components/Button';

const Login: React.FC = () => {

  const navigate = useNavigate();

  const {
    login,
    isAuthenticated,
    error: authError,
  } = useAuth();

  const [formData, setFormData] =
    useState({
      email: '',
      password: '',
    });

  const [errors, setErrors] =
    useState<{
      email?: string;
      password?: string;
    }>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const loginCompleted = useRef(false);

  // =========================================
  // HANDLE LOGIN SUCCESS
  // =========================================

  useEffect(() => {

    if (isAuthenticated && !loginCompleted.current) {

      loginCompleted.current = true;
      navigate('/dashboard');
    }

  }, [isAuthenticated, navigate]);

  // =========================================
  // VALIDATION
  // =========================================

  const validateForm = (): boolean => {

    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!formData.email) {

      newErrors.email =
        'Email is required';

    } else if (
      !/\S+@\S+\.\S+/.test(
        formData.email
      )
    ) {

      newErrors.email =
        'Email is invalid';
    }

    if (!formData.password) {

      newErrors.password =
        'Password is required';

    } else if (
      formData.password.length < 6
    ) {

      newErrors.password =
        'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // RESET STATE
    loginCompleted.current = false;
    setIsSubmitting(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch {
      setErrors({
        email:
          'Invalid email or password',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // HANDLE CHANGE
  // =========================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (
      errors[name as keyof typeof errors]
    ) {

      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // =========================================
  // UI
  // =========================================

  return (

    <div className="min-h-screen bg-gray-100 relative overflow-hidden">

      {/* TOP BLUE SECTION */}

      <div className="absolute top-0 left-0 w-full h-[260px] bg-gradient-to-r from-blue-600 to-blue-700"></div>

      {/* MAIN CONTAINER */}

      <div className="relative z-10 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-6xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[700px]">

          {/* LEFT PANEL */}

          <div className="hidden lg:flex lg:w-[38%] bg-gradient-to-b from-blue-500 to-blue-700 items-center justify-center relative">

            <div className="text-center text-white px-10">

              <h2 className="text-5xl font-extrabold leading-tight mb-6">
                Welcome
                <br />
                Back
              </h2>

              <p className="text-lg text-blue-100 leading-8">
                Sign in and manage your
                tickets efficiently with
                our smart ticket management
                platform.
              </p>

            </div>

          </div>

          {/* RIGHT PANEL */}

          <div className="flex-1 px-6 sm:px-10 lg:px-16 py-10 lg:py-14 flex flex-col justify-center">

            {/* HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-12">

              <div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                  Sign In
                </h1>

                <p className="mt-4 text-gray-500 text-base leading-7 max-w-md">
                  Login to continue using
                  Ticket Management System
                </p>

              </div>

              {/* <div className="text-sm text-gray-500">

                Don&apos;t have an account?

                <Link
                  to="/register"
                  className="block text-blue-600 font-semibold hover:underline mt-1"
                >
                  Sign Up
                </Link>

              </div> */}

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >

              {/* EMAIL */}

              <div>

                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full h-14 px-4 rounded-2xl border text-sm outline-none transition-all
                  ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                />

                {errors.email && (

                  <p className="text-red-500 text-sm mt-2">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Password
                </label>

                <div className="relative">

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full h-14 px-4 pr-12 rounded-2xl border text-sm outline-none transition-all
                  ${
                    errors.password
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>

                </div>

                {errors.password && (

                  <p className="text-red-500 text-sm mt-2">
                    {errors.password}
                  </p>
                )}

                <Link
                  to="/forgot-password"
                  className="block text-sm text-blue-600 font-semibold hover:underline mt-2"
                >
                  Forgot Password?
                </Link>

              </div>

              {/* AUTH ERROR */}

              {authError && (

                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-4 rounded-2xl text-sm">
                  {authError}
                </div>
              )}

              {/* BUTTON */}

              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-base font-semibold"
              >
                {isSubmitting
                  ? 'Signing In...'
                  : 'Sign In'}
              </Button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;