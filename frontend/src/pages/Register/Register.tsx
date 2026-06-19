import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { FiEye, FiEyeOff } from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";

import Button from "../../components/Button";

import {
  passwordRequirementsMessage,
  validateEmail,
  validatePassword,
} from "../../utils/validators";
// import { companyService } from "@/services/companyService";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const {
    register: registerAction,
    isAuthenticated,
    error: authError,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyMail: "",
    designation: "",
    empId: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    companyName?: string;
    companyMail?: string;
    designation?: string;
    empId?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // const [companies, setCompanies] = useState<string[]>([]);

  // const [showDropdown, setShowDropdown] = useState(false);

  // const dropdownRef = useRef<HTMLDivElement | null>(null);

  const registrationCompleted = useRef(false);

  // =========================================
  // HANDLE REGISTRATION SUCCESS
  // =========================================

  useEffect(() => {
    if (isAuthenticated && !registrationCompleted.current) {
      registrationCompleted.current = true;
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // useEffect(() => {
  //   const fetchCompanies = async () => {
  //     try {
  //       const data = await companyService.getCompanies();

  //       setCompanies(data.map((c) => c.companyName));
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchCompanies();
  // }, []);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       dropdownRef.current &&
  //       !dropdownRef.current.contains(event.target as Node)
  //     ) {
  //       setShowDropdown(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // const filteredCompanies = companies.filter((company) =>
  //   company.toLowerCase().includes(formData.companyName.toLowerCase()),
  // );

  // =========================================
  // VALIDATION
  // =========================================

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      companyName?: string;
      designation?: string;
      empId?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordErrors = validatePassword(formData.password);

      if (passwordErrors && typeof passwordErrors === "string") {
        newErrors.password = passwordErrors;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // RESET STATE
    registrationCompleted.current = false;
    setIsSubmitting(true);

    try {
      await registerAction({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName || undefined,
        companyMail: formData.companyMail || undefined,
        designation: formData.designation || undefined,
        empId: formData.empId || undefined,
      });
    } catch (error) {
      setErrors({
        email: "Registration failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // HANDLE CHANGE
  // =========================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value
          ? validatePassword(value)
            ? undefined
            : passwordRequirementsMessage
          : undefined,
      }));
      return;
    }

    if (errors[name as keyof typeof errors]) {
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
      {/* TOP BLUE BACKGROUND */}

      <div className="absolute top-0 left-0 w-full h-[260px] bg-gradient-to-r from-blue-600 to-blue-700"></div>

      {/* CONTAINER */}

      <div className="relative z-10 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[760px]">
          {/* LEFT PANEL */}

          <div className="hidden lg:flex lg:w-[38%] bg-gradient-to-b from-blue-500 to-blue-700 relative items-center justify-center">
            <div className="text-center text-white px-10">
              <h2 className="text-5xl font-extrabold leading-tight mb-6">
                Welcome
              </h2>

              <p className="text-lg text-blue-100 leading-8">
                Create your account and manage tickets professionally with our
                modern ticket management system.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex-1 px-6 sm:px-10 lg:px-16 py-10 lg:py-14">
            {/* HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                  Create
                  <br />
                  Account
                </h1>

                <p className="mt-4 text-gray-500 text-base leading-7 max-w-md">
                  Sign up to get started with Ticket Management System
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Already have an account?
                <Link
                  to="/login"
                  className="block text-blue-600 font-semibold hover:underline mt-1"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* GRID */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NAME */}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full h-14 px-4 rounded-2xl border text-sm outline-none transition-all
                    ${errors.name
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                  />

                  {errors.name && (
                    <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                  )}
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full h-14 px-4 rounded-2xl border text-sm outline-none transition-all
                    ${errors.email
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                  />

                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                  )}
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password *
                  </label>

                  <div className="relative">

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      className={`w-full h-14 px-4 pr-12 rounded-2xl border text-sm outline-none transition-all
                    ${errors.password
                          ? "border-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
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

                  {/* <p className="text-xs text-gray-500 leading-6 mt-3">
                    Must be at least 8 characters and include uppercase,
                    lowercase, a number, and a special character
                  </p> */}
                </div>

                {/* CONFIRM PASSWORD */}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Confirm Password *
                  </label>

                  <div className="relative">

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className={`w-full h-14 px-4 pr-12 rounded-2xl border text-sm outline-none transition-all
                    ${errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>

                  </div>

                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* COMPANY ADMIN EMAILS */}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Company Admin Emails
                  </label>

                  <input
                    type="text"
                    name="companyMail"
                    value={formData.companyMail}
                    onChange={handleChange}
                    placeholder="admin1@company.com, admin2@company.com"
                    className={`w-full h-14 px-4 rounded-2xl border text-sm outline-none transition-all
    ${errors.companyMail
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    Multiple emails should be separated by commas
                  </p>

                  {errors.companyMail && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.companyMail}
                    </p>
                  )}
                </div>

                {/* COMPANY */}

                {/* <div ref={dropdownRef} className="relative">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Enter company name"
                    autoComplete="off"
                    className="w-full h-14 px-4 rounded-2xl border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  {showDropdown && filteredCompanies.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        {filteredCompanies.map((company, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                companyName: company,
                              }));

                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-none"
                          >
                            {company}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div> */}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="
      w-full
      h-14
      px-4
      rounded-2xl
      border
      border-gray-300
      text-sm
      outline-none
      focus:border-blue-500
      focus:ring-4
      focus:ring-blue-100
    "
                  />
                </div>

                {/* DESIGNATION */}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                    className="w-full h-14 px-4 rounded-2xl border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
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
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
