import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Button from '../../components/Button';
import ForgotPasswordService from '../../services/forgotPasswordService';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
    submit?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // =========================================
  // GET TOKEN FROM URL
  // =========================================

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setErrors({ token: 'Invalid reset link. Please request a new password reset.' });
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  // =========================================
  // VALIDATION
  // =========================================

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!token) {
      newErrors.token = 'Invalid reset token';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await ForgotPasswordService.resetPassword(token, newPassword);

      if (response.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrors({
          submit: response.error?.message || 'Failed to reset password',
        });
      }
    } catch (err: any) {
      const errorMessage = err?.error?.message || 'Failed to reset password. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // HANDLE CHANGES
  // =========================================

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (errors.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: undefined }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  // =========================================
  // PASSWORD STRENGTH INDICATOR
  // =========================================

  const getPasswordStrength = () => {
    if (!newPassword) return { level: 0, text: '', color: '' };

    let strength = 0;
    if (newPassword.length >= 6) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;

    const levels = [
      { level: 1, text: 'Weak', color: 'bg-red-500' },
      { level: 2, text: 'Fair', color: 'bg-yellow-500' },
      { level: 3, text: 'Good', color: 'bg-blue-500' },
      { level: 4, text: 'Strong', color: 'bg-green-500' },
      { level: 5, text: 'Very Strong', color: 'bg-green-600' },
    ];

    return levels[strength - 1] || { level: 0, text: '', color: '' };
  };

  const passwordStrength = getPasswordStrength();

  // =========================================
  // UI
  // =========================================

  if (errors.token) {
    return (
      <div className="min-h-screen bg-gray-100 relative overflow-hidden">
        {/* TOP BLUE SECTION */}
        <div className="absolute top-0 left-0 w-full h-[260px] bg-gradient-to-r from-blue-600 to-blue-700"></div>

        {/* MAIN CONTAINER */}
        <div className="relative z-10 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl p-6 sm:p-10 lg:p-16">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-red-100 rounded-full">
                  <svg
                    className="w-12 h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Invalid Reset Link</h1>

              <p className="text-gray-500 text-base mb-8">{errors.token}</p>

              <Link
                to="/forgot-password"
                className="inline-block h-12 px-8 rounded-2xl text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Create a New
                <br />
                Password
              </h2>

              <p className="text-lg text-blue-100 leading-8">
                Make sure your new password is strong and unique. Avoid using common words or personal information.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 px-6 sm:px-10 lg:px-16 py-10 lg:py-14 flex flex-col justify-center">
            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Reset Password
              </h1>

              <p className="mt-4 text-gray-500 text-base leading-7">
                Enter a new strong password to secure your account.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NEW PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">New Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    disabled={isSubmitting}
                    className={`w-full h-14 px-4 pr-12 rounded-2xl border text-sm outline-none transition-all
                    ${
                      errors.newPassword
                        ? 'border-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    }
                    ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                    `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M15.171 13.576l1.414 1.414A10.015 10.015 0 0020.542 10c-1.274-4.057-5.064-7-9.542-7a9.958 9.958 0 00-2.053.204l1.44 1.44C12.584 5.163 13.761 5 15 5c3.314 0 6.130 1.756 7.322 4.31A8.01 8.01 0 0015.171 13.576z" />
                      </svg>
                    )}
                  </button>
                </div>

                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-2">{errors.newPassword}</p>
                )}

                {/* PASSWORD STRENGTH */}
                {newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all`}
                          style={{ width: `${(passwordStrength.level * 20) % 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{passwordStrength.text}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Password should contain uppercase, lowercase, numbers, and symbols
                    </p>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Confirm Password</label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                    className={`w-full h-14 px-4 pr-12 rounded-2xl border text-sm outline-none transition-all
                    ${
                      errors.confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    }
                    ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                    `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M15.171 13.576l1.414 1.414A10.015 10.015 0 0020.542 10c-1.274-4.057-5.064-7-9.542 7a9.958 9.958 0 00-2.053.204l1.44 1.44C12.584 5.163 13.761 5 15 5c3.314 0 6.130 1.756 7.322 4.31A8.01 8.01 0 0015.171 13.576z" />
                      </svg>
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
                )}
              </div>

              {/* ERROR MESSAGE */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-4 rounded-2xl text-sm">
                  {errors.submit}
                </div>
              )}

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
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
