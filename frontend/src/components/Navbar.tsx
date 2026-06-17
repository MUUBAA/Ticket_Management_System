import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../hooks/useAuth";

import {
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {

  const {
    isAuthenticated,
    user,
    logout,
    clearError,
  } = useAuth();

  const navigate =
    useNavigate();

  // =========================
  // PROFILE DROPDOWN
  // =========================

  const [
    isDropdownOpen,
    setIsDropdownOpen,
  ] = useState(false);

  // =========================
  // MOBILE NAV DROPDOWN
  // =========================

  const [
    isMobileNavOpen,
    setIsMobileNavOpen,
  ] = useState(false);

  const [
    mobileNavTitle,
    setMobileNavTitle,
  ] = useState("Dashboard");

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  const mobileNavRef =
    useRef<HTMLDivElement>(null);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout =
    async () => {

      await logout();

      setIsDropdownOpen(false);

      navigate("/login");
    };

  // =========================
  // TOGGLE PROFILE
  // =========================

  const toggleDropdown =
    () => {

      setIsDropdownOpen(
        !isDropdownOpen
      );
    };

  // =========================
  // OUTSIDE CLICK
  // =========================

  useEffect(() => {

    const handleClickOutside =
      (
        event: MouseEvent
      ) => {

        // Profile Dropdown

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target as Node
          )
        ) {

          setIsDropdownOpen(
            false
          );
        }

        // Mobile Nav Dropdown

        if (
          mobileNavRef.current &&
          !mobileNavRef.current.contains(
            event.target as Node
          )
        ) {

          setIsMobileNavOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  return (

    <nav
      className="
        sticky
        top-0
        z-50
        bg-white
        shadow-sm
        border-b
        border-gray-200
      "
    >

      <div
        className="
          max-w-[1800px]
          mx-auto
          px-3 sm:px-6 lg:px-8
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            h-16
            relative
          "
        >

          {/* ========================= */}
          {/* LEFT - LOGO */}
          {/* ========================= */}

          <Link
            to="/"
            className="
              flex
              items-center
              gap-2
              hover:opacity-80
              transition-opacity
            "
          >

            <div
              className="
                flex
                items-center
                justify-center
                w-9 h-9
                sm:w-10 sm:h-10
                rounded-lg
                bg-gradient-to-r
                from-indigo-600
                to-cyan-500
              "
            >

              <SparklesIcon
                className="
                  w-5 h-5
                  sm:w-6 sm:h-6
                  text-white
                "
              />

            </div>

            <div
              className="
                hidden
                sm:flex
                flex-col
              "
            >

              <span
                className="
                  text-sm
                  font-bold
                  text-gray-900
                "
              >
                TMS
              </span>

              <span
                className="
                  text-xs
                  text-gray-500
                "
              >
                Management
              </span>

            </div>

          </Link>

          {/* ========================= */}
          {/* CENTER NAVIGATION */}
          {/* ========================= */}

          {isAuthenticated && (

            <>

              {/* ===================== */}
              {/* DESKTOP NAV */}
              {/* ===================== */}

              <div
                className="
                  hidden
                  md:flex
                  items-center
                  gap-8
                "
              >

                <Link
                  to="/"
                  className="
                    text-gray-600
                    hover:text-indigo-600
                    font-medium
                    text-sm
                    transition-colors
                    duration-200
                    whitespace-nowrap
                  "
                >
                  Dashboard
                </Link>

                <Link
                  to="/tickets"
                  className="
                    text-gray-600
                    hover:text-indigo-600
                    font-medium
                    text-sm
                    transition-colors
                    duration-200
                    whitespace-nowrap
                  "
                >
                  Tickets
                </Link>

                <Link
                  to="/reports"
                  className="
                    text-gray-600
                    hover:text-indigo-600
                    font-medium
                    text-sm
                    transition-colors
                    duration-200
                    whitespace-nowrap
                  "
                >
                  Reports
                </Link>

              </div>

              {/* ===================== */}
              {/* MOBILE NAV */}
              {/* ===================== */}

              <div
                ref={mobileNavRef}
                className="
                  md:hidden
                  absolute
                  left-1/2
                  -translate-x-1/2
                "
              >

                <button
                  onClick={() =>
                    setIsMobileNavOpen(
                      !isMobileNavOpen
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-1
                    px-3
                    py-2
                    rounded-lg
                    bg-gray-100
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >

                  {mobileNavTitle}

                  <ChevronDownIcon
                    className={`
                      w-4
                      h-4
                      transition-transform
                      duration-200
                      ${isMobileNavOpen
                        ? "rotate-180"
                        : ""
                      }
                    `}
                  />

                </button>

                {isMobileNavOpen && (

                  <div
                    className="
                      absolute
                      top-12
                      left-1/2
                      -translate-x-1/2
                      w-40
                      bg-white
                      rounded-xl
                      shadow-lg
                      border
                      border-gray-200
                      py-2
                      z-50
                    "
                  >
                    <Link
                      to="/"
                      onClick={() => {

                        setMobileNavTitle(
                          "Dashboard"
                        );

                        setIsMobileNavOpen(
                          false
                        );
                      }}
                      className="
    block
    px-4
    py-2
    text-sm
    text-gray-700
    hover:bg-gray-50
  "
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/tickets"
                      onClick={() => {

                        setMobileNavTitle(
                          "Tickets"
                        );

                        setIsMobileNavOpen(
                          false
                        );
                      }}
                      className="
    block
    px-4
    py-2
    text-sm
    text-gray-700
    hover:bg-gray-50
  "
                    >
                      Tickets
                    </Link><Link
                      to="/reports"
                      onClick={() => {

                        setMobileNavTitle(
                          "Reports"
                        );

                        setIsMobileNavOpen(
                          false
                        );
                      }}
                      className="
    block
    px-4
    py-2
    text-sm
    text-gray-700
    hover:bg-gray-50
  "
                    >
                      Reports
                    </Link>

                  </div>
                )}

              </div>

            </>
          )}

          {/* ========================= */}
          {/* RIGHT USER SECTION */}
          {/* ========================= */}

          <div
            className="
              flex
              items-center
              gap-2 sm:gap-4
            "
          >

            {isAuthenticated ? (

              <div
                className="
                  relative
                "
                ref={dropdownRef}
              >

                {/* PROFILE BUTTON */}

                <button
                  onClick={
                    toggleDropdown
                  }
                  className="
                    flex
                    items-center
                    gap-2 sm:gap-3
                    px-2 sm:px-3
                    py-2
                    rounded-lg
                    hover:bg-gray-50
                    transition-colors
                    duration-200
                  "
                >

                  <div
                    className="
                      hidden
                      md:flex
                      flex-col
                      items-end
                    "
                  >

                    <span
                      className="
                        text-sm
                        font-semibold
                        text-gray-900
                      "
                    >
                      {user?.name}
                    </span>

                    <span
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      {
                        user?.designation
                      }
                    </span>

                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      w-9 h-9
                      sm:w-10 sm:h-10
                      rounded-full
                      bg-gradient-to-r
                      from-indigo-500
                      to-cyan-500
                      text-white
                      font-bold
                      text-sm
                    "
                  >

                    {
                      user?.name
                        ?.charAt(0)
                        .toUpperCase()
                    }

                  </div>

                  <ChevronDownIcon
                    className={`
                      w-4
                      h-4
                      text-gray-400
                      transition-transform
                      duration-200
                      ${isDropdownOpen
                        ? "rotate-180"
                        : ""
                      }
                    `}
                  />

                </button>

                {/* PROFILE DROPDOWN */}

                {isDropdownOpen && (

                  <div
                    className="
                      absolute
                      right-0
                      mt-2
                      w-48
                      bg-white
                      rounded-xl
                      shadow-lg
                      border
                      border-gray-200
                      py-2
                      z-50
                    "
                  >

                    <div
                      className="
                        px-4
                        py-3
                        border-b
                        border-gray-100
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-medium
                          text-gray-900
                        "
                      >
                        {user?.name}
                      </p>

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        {user?.email}
                      </p>

                    </div>

                    <div
                      className="
                        border-t
                        border-gray-100
                        my-2
                      "
                    />

                    <button
                      onClick={
                        handleLogout
                      }
                      onClickCapture={() =>
                        clearError()
                      }
                      className="
                        w-full
                        flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        text-sm
                        text-red-600
                        hover:bg-red-50
                        transition-colors
                        duration-200
                      "
                    >

                      <ArrowLeftOnRectangleIcon
                        className="
                          w-4 h-4
                        "
                      />

                      Logout

                    </button>

                  </div>
                )}

              </div>

            ) : (

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Link
                  to="/login"
                  className="
                    px-3 sm:px-4
                    py-2
                    text-xs sm:text-sm
                    font-medium
                    text-gray-700
                    hover:text-gray-900
                    transition-colors
                    duration-200
                  "
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="
                    px-3 sm:px-4
                    py-2
                    text-xs sm:text-sm
                    font-medium
                    bg-indigo-600
                    text-white
                    rounded-lg
                    hover:bg-indigo-700
                    transition-colors
                    duration-200
                  "
                >
                  Register
                </Link>

              </div>
            )}

          </div>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;