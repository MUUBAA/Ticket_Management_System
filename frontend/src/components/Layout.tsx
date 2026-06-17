import React from "react";

import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";

import "./Layout.css";

const Layout: React.FC = () => {
  return (
    <div
      className="
        min-h-screen
        bg-gray-50
        flex
        flex-col
      "
    >
      {/* =====================================
          NAVBAR
      ====================================== */}

      <Navbar />

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main
        className="
          flex-1
          w-full
          px-3
          sm:px-4
          md:px-6
          lg:px-8
          py-4
          md:py-6
        "
      >
        <div
          className="
            w-full
            max-w-[1800px]
            mx-auto
         "
        >
          <Outlet />
        </div>
      </main>

      {/* =====================================
          FOOTER
      ====================================== */}

      <footer
        className="
          bg-white
          border-t
          border-gray-200
          py-4
          mt-auto
        "
      >
        <div
          className="
            max-w-[1800px]
            mx-auto
            px-6
            xl:px-8
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              items-center
              justify-between
              gap-2
            "
          >
            <p
              className="
                text-sm
                text-gray-500
                text-center
                sm:text-left
              "
            >
              © 2026 Ticket Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
