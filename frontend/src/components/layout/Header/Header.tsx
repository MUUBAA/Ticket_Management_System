import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../../../hooks/useAuth';

interface HeaderProps {
  onLogout?: () => void;
}

const Header:
React.FC<HeaderProps> = ({
  onLogout,
}) => {

  // =====================================
  // HOOKS
  // =====================================

  const navigate =
    useNavigate();

  const {
    user,
    loading,
    logout,
    clearError,
  } = useAuth();

  // =====================================
  // STATES
  // =====================================

  const [
    isDropdownOpen,
    setIsDropdownOpen,
  ] = useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // =====================================
  // OUTSIDE CLICK
  // =====================================

  useEffect(() => {

    const handleClickOutside =
      (
        event: MouseEvent
      ) => {

        if (
          dropdownRef.current
          &&
          !dropdownRef.current.contains(
            event.target as Node
          )
        ) {

          setIsDropdownOpen(
            false
          );
        }
      };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };

  }, []);

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout =
    async () => {

      try {

        clearError();

        await logout();

        setIsDropdownOpen(
          false
        );

        if (onLogout) {

          onLogout();
        }

        navigate(
          '/login'
        );

      } catch (error) {

        console.error(
          'Logout failed',
          error
        );
      }
    };

  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <header
        className="
          bg-white
          shadow-sm
          border-b
          border-gray-200
          sticky
          top-0
          z-40
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
          "
        >

          <div
            className="
              flex
              justify-between
              items-center
              h-16
            "
          >

            <div
              className="
                animate-pulse
                bg-gray-300
                h-8
                w-40
                rounded-lg
              "
            />

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className="
                  animate-pulse
                  bg-gray-300
                  h-10
                  w-10
                  rounded-full
                "
              />

              <div
                className="
                  hidden
                  sm:block
                  animate-pulse
                  bg-gray-300
                  h-8
                  w-28
                  rounded-lg
                "
              />

            </div>

          </div>

        </div>

      </header>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (

    <header
      className="
        bg-white
        shadow-sm
        border-b
        border-gray-200
        sticky
        top-0
        z-40
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            h-16
          "
        >

          {/* =================================
              LOGO
          ================================== */}

          <div
            className="
              flex
              items-center
              gap-3
              cursor-pointer
            "

            onClick={() =>
              navigate('/')
            }
          >

            <div
              className="
                w-10
                h-10
                bg-gradient-to-br
                from-indigo-600
                to-purple-600
                rounded-xl
                flex
                items-center
                justify-center
                shadow-md
              "
            >

              <svg
                className="
                  w-5
                  h-5
                  text-white
                "

                fill="none"

                stroke="currentColor"

                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"

                  strokeLinejoin="round"

                  strokeWidth={2}

                  d="
                    M9 12h6
                    m-6 4h6
                    m2 5H7
                    a2 2 0 01-2-2V5
                    a2 2 0 012-2h5.586
                    a1 1 0 01.707.293
                    l5.414 5.414
                    a1 1 0 01.293.707V19
                    a2 2 0 01-2 2z
                  "
                />

              </svg>

            </div>

            <div>

              <h1
                className="
                  text-lg
                  sm:text-xl
                  font-bold
                  text-gray-900
                "
              >
                TicketFlow
              </h1>

              <p
                className="
                  text-xs
                  text-gray-500
                  hidden
                  sm:block
                "
              >
                Ticket Management
              </p>

            </div>

          </div>

          {/* =================================
              USER MENU
          ================================== */}

          {user && (

            <div
              className="
                relative
              "

              ref={
                dropdownRef
              }
            >

              {/* USER BUTTON */}

              <button
                onClick={() =>
                  setIsDropdownOpen(
                    !isDropdownOpen
                  )
                }

                className="
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2
                  rounded-xl
                  hover:bg-gray-100
                  transition-all
                  duration-200
                "
              >

                {/* AVATAR */}

                <div
                  className="
                    w-10
                    h-10
                    bg-gradient-to-br
                    from-indigo-500
                    to-purple-500
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    font-semibold
                    text-sm
                    shadow-md
                  "
                >

                  {
                    user.name
                      ?.charAt(0)
                      .toUpperCase()
                  }

                </div>

                {/* USER INFO */}

                <div
                  className="
                    hidden
                    sm:flex
                    flex-col
                    items-start
                  "
                >

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-gray-900
                    "
                  >
                    {user.name}
                  </span>

                  <span
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    {
                      user.designation
                      || 'User'
                    }
                  </span>

                </div>

                {/* DROPDOWN ICON */}

                <svg
                  className={`
                    w-4
                    h-4
                    text-gray-500
                    transition-transform
                    duration-200
                    ${
                      isDropdownOpen
                        ? 'rotate-180'
                        : ''
                    }
                  `}

                  fill="none"

                  stroke="currentColor"

                  viewBox="0 0 24 24"
                >

                  <path
                    strokeLinecap="round"

                    strokeLinejoin="round"

                    strokeWidth={2}

                    d="
                      M19 9l-7 7-7-7
                    "
                  />

                </svg>

              </button>

              {/* =================================
                  DROPDOWN
              ================================== */}

              {isDropdownOpen && (

                <div
                  className="
                    absolute
                    right-0
                    mt-2
                    w-64
                    bg-white
                    rounded-2xl
                    shadow-xl
                    border
                    border-gray-100
                    overflow-hidden
                    z-50
                  "
                >

                  {/* USER INFO */}

                  <div
                    className="
                      px-5
                      py-4
                      border-b
                      border-gray-100
                      bg-gray-50
                    "
                  >

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-gray-900
                      "
                    >
                      {user.name}
                    </p>

                    <p
                      className="
                        text-xs
                        text-gray-500
                        mt-1
                        break-all
                      "
                    >
                      {user.email}
                    </p>

                  </div>

                  {/* PROFILE */}

                  <button
                    onClick={() => {

                      navigate(
                        '/profile'
                      );

                      setIsDropdownOpen(
                        false
                      );
                    }}

                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-5
                      py-3
                      text-sm
                      text-gray-700
                      hover:bg-gray-50
                      transition-colors
                    "
                  >

                    👤 Profile

                  </button>

                  {/* SETTINGS */}

                  <button
                    onClick={() => {

                      navigate(
                        '/settings'
                      );

                      setIsDropdownOpen(
                        false
                      );
                    }}

                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-5
                      py-3
                      text-sm
                      text-gray-700
                      hover:bg-gray-50
                      transition-colors
                    "
                  >

                    ⚙️ Settings

                  </button>

                  {/* DIVIDER */}

                  <div
                    className="
                      border-t
                      border-gray-100
                    "
                  />

                  {/* LOGOUT */}

                  <button
                    onClick={
                      handleLogout
                    }

                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-5
                      py-3
                      text-sm
                      text-red-600
                      hover:bg-red-50
                      transition-colors
                    "
                  >

                    🚪 Logout

                  </button>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </header>
  );
};

export default Header;