import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import ForgotPasswordService from '../../services/forgotPasswordService';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // =========================================
  // VALIDATION
  // =========================================

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateEmail()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await ForgotPasswordService.forgotPassword(email);

      if (response.success) {
        setSuccessMessage(response.message || 'Password reset email has been sent. Please check your email.');
        setEmail('');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.error?.message || 'Failed to send password reset email');
      }
    } catch (err: any) {
      const errorMessage = err?.error?.message || 'Failed to send password reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // HANDLE CHANGE
  // =========================================

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
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
        <div className="w-full max-w-6xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[600px]">
          {/* LEFT PANEL */}
          <div className="hidden lg:flex lg:w-[38%] bg-gradient-to-b from-blue-500 to-blue-700 items-center justify-center relative">
            <div className="text-center text-white px-10">
              <h2 className="text-5xl font-extrabold leading-tight mb-6">
                Reset Your
                <br />
                Password
              </h2>

              <p className="text-lg text-blue-100 leading-8">
                No worries! We&apos;ll help you recover your account. Enter your email and we&apos;ll send you a password reset link.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 px-6 sm:px-10 lg:px-16 py-10 lg:py-14 flex flex-col justify-center">
            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Forgot Password?
              </h1>

              <p className="mt-4 text-gray-500 text-base leading-7 max-w-md">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  className={`w-full h-14 px-4 rounded-2xl border text-sm outline-none transition-all
                  ${
                    error
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }
                  ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                  `}
                />

                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>

              {/* SUCCESS MESSAGE */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-4 rounded-2xl text-sm">
                  {successMessage}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-base font-semibold"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {/* DIVIDER */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Remember your password?</span>
                </div>
              </div>

              {/* LOGIN LINK */}
              <Link
                to="/login"
                className="w-full h-14 rounded-2xl text-base font-semibold flex items-center justify-center border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all"
              >
                Back to Sign In
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
