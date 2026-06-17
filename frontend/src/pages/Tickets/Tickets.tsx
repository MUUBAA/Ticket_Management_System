import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "../../store/hooks";

import { fetchTickets } from "../../store/slices/ticketSlice";

import Button from "../../components/Button";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

// import EmptyState
//   from '../../components/common/EmptyState/EmptyState';

import StatusBadge from "../../components/common/StatusBadge/StatusBadge";

import Table, { type TableColumn } from "../../components/common/Table/Table";

import type { Ticket } from "../../types/ticket";


import "./Tickets.css";

const Tickets: React.FC = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  // =====================================
  // STATES
  // =====================================

  const [filter, setFilter] = useState<
    "All" | "Open" | "InProgress" | "OnHold" | "Closed"
  >("All");

  const {
    tickets = [],

    loading,

    error,

    pagination = {
      page: 1,

      pageSize: 10,

      totalItems: 0,
    },
  } = useAppSelector((state) => state.tickets);

  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [ticketPagination, setTicketPagination] = useState({
    page: 1,

    limit: 10,
  });

  // =====================================
  // PROJECTS
  // =====================================

  const projects = [
    "Rethink POS",

    "Intellectual POS",

    "Eway Addon",

    "Retail Addon",

    "Item Upload Addon",

    "Bulk Upload Addon",

    "SAP",

    "Sellerkit",

    "WMS",

    "Software Development",

    "Application  Development",

    "Btrans",

    "CRM eServe",

    "Store Management System",

    "Waresmart",

    "Verifyt",

    "Delivryt",

    "Bajaj Integration",

    "Sony EDI Integration",

    "LG EDI Integration",

    "HDB Integration",

    "IDFC Integration",

    "whatsapp integration",

    "Others",
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // =====================================
  // FETCH TICKETS
  // =====================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(
          fetchTickets({
            page: ticketPagination.page,

            limit: ticketPagination.limit,

            status: filter === "All" ? undefined : filter,

            ticketId: debouncedSearch ? Number(debouncedSearch) : undefined,

            sortBy: "ticket_id",

            sortOrder,
          }),
        ).unwrap();
      } catch (err: any) {
        console.error("Failed to fetch tickets:", err);
      }
    };

    fetchData();
  }, [
    dispatch,
    filter,
    debouncedSearch,
    sortOrder,
    ticketPagination.page,
    ticketPagination.limit,
  ]);
  // =====================================
  // CREATE TICKET
  // =====================================

  const handleCreateTicket = () => {
    navigate("/tickets/create");
  };

  // =====================================
  // VIEW TICKET
  // =====================================

  const handleViewTicket = (row: Ticket) => {
    navigate(`/tickets/${row.ticketId}`);
  };

  // =====================================
  // UPDATE PROJECT
  // =====================================

  // const handleProjectChange =
  //   async (
  //     ticket: Ticket,
  //     projectName: string
  //   ) => {

  //     try {

  //       await dispatch(
  //         updateTicket({
  //           id:
  //             ticket.ticketId,

  //           data: {

  //             title:
  //               ticket.title,

  //             description:
  //               ticket.description,

  //             status:
  //               ticket.status as TicketStatus,

  //             ticketType:
  //               ticket.ticketType as string,

  //             projectName:
  //               projectName,
  //           },
  //         })
  //       );

  //       // REFRESH

  //       dispatch(
  //         fetchTickets({
  //           page: 1,
  //           limit: 10,
  //         })
  //       );

  //     } catch (err) {

  //       console.error(
  //         'Failed to update project',
  //         err
  //       );
  //     }
  //   };

  // =====================================
  // TABLE COLUMNS
  // =====================================

  const handlePageChange = (newPage: number) => {
    setTicketPagination((prev) => ({
      ...prev,

      page: Math.max(
        1,

        Math.min(
          newPage,

          Math.ceil(pagination.totalItems / ticketPagination.limit),
        ),
      ),
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    setTicketPagination({
      page: 1,

      limit: newLimit,
    });
  };

  const tableColumns: TableColumn<Ticket>[] = [
    // ===================================
    // ID
    // ===================================

    {
      key: "ticketId",

      label: (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
          }}
          className="
        flex
        items-center
        gap-1
        font-semibold
      "
        >
          <span>Ticket ID</span>

          {sortOrder === "ASC" ? (
            <FiArrowUp
              className="
                text-indigo-600
              "
            />
          ) : (
            <FiArrowDown
              className="
                text-indigo-600
              "
            />
          )}
        </button>
      ),

      render: (value) => <span>#{String(value)}</span>,
    },

    // ===================================
    // PROJECT NAME
    // ===================================

    {
      key: "projectName",

      label: "Project Name",

      render: (_value, row) => (
        <select
          value={row.projectName || ""}
          disabled
          className="
    min-w-[220px]
    px-3
    py-2
    border
    border-gray-300
    rounded-lg
    text-sm
    bg-gray-100
    text-gray-600
    cursor-not-allowed
  "
        >
          <option value="">Select Project</option>

          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
      ),
    },

    // ===================================
    // CREATED BY NAME
    // ===================================

    {
      key: "createdByName",

      label: "Name",

      render: (value) => (

        <div
          className="
        min-w-[160px]
      "
        >

          <span
            className="
          text-sm
          font-medium
          text-gray-900
        "
          >
            {
              String(
                value || "-"
              )
            }
          </span>

        </div>
      ),
    },

    // ===================================
    // CREATED BY EMAIL
    // ===================================

    {
      key: "createdByEmail",

      label: "Email",

      render: (value) => (

        <div
          className="
        min-w-[220px]
      "
        >

          <span
            className="
          text-sm
          text-gray-600
        "
          >
            {
              String(
                value || "-"
              )
            }
          </span>

        </div>
      ),
    },

    // ===================================
    // STATUS
    // ===================================

    {
      key: "status",

      label: "Status",

      render: (value) => <StatusBadge status={value as string} />,
    },

    // ===================================
    // CREATED DATE
    // ===================================

    {
      key: "createdAt",

      label: "Created",

      render: (value) => (
        <>
          {new Date(value as string).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </>
      ),
    },
  ];

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-gray-50
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
          "
        >
          <div
            className="
              animate-pulse
              space-y-6
            "
          >
            <div
              className="
                h-8
                bg-gray-200
                rounded
                w-48
              "
            />

            <div
              className="
                h-96
                bg-gray-200
                rounded-xl
              "
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-50
      "
      >
        <div
          className="
          bg-white
          border
          border-red-200
          rounded-xl
          shadow-sm
          p-8
          max-w-md
          w-full
          text-center
        "
        >
          <div
            className="
            text-red-500
            text-5xl
            mb-4
          "
          >
            ⚠️
          </div>

          <h2
            className="
            text-xl
            font-semibold
            text-gray-900
            mb-2
          "
          >
            Failed to Load Tickets
          </h2>

          <p
            className="
            text-gray-600
            mb-6
          "
          >
            {error}
          </p>

          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  // =====================================
  // MAIN
  // =====================================

  return (
    <div
      className="
        min-h-screen
        bg-gray-50
      "
    >
      {/* HEADER */}

      <div
        className="
          bg-white
          border-b
          border-gray-200
        "
      >
        <div
          className="
            max-w-[1800px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <h1
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >
                Support Desk Tickets
              </h1>

              <p
                className="
                  text-sm
                  text-gray-600
                  mt-1
                "
              >
                View and manage all support tickets
              </p>
            </div>

            <Button onClick={handleCreateTicket} variant="primary">
              Create New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* BODY */}

      <div
        className="
          max-w-[1800px]
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-8
        "
      >
        {/* FILTERS */}

        <div
          className="
            bg-white
            rounded-xl
            shadow-sm
            border
            border-gray-200
            mb-8
          "
        >
          <div
            className="
              px-6
              py-4
              border-b
              border-gray-200
            "
          >
            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                justify-between
                gap-4
              "
            >
              {/* STATUS FILTERS */}

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {["All", "Open", "InProgress", "OnHold", "Closed"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setTicketPagination((prev) => ({
                          ...prev,
                          page: 1,
                        }));

                        setFilter(status as any);
                      }}
                      className={`
                        px-3
                        py-1.5
                        text-sm
                        font-medium
                        rounded-lg
                        transition-colors

                        ${filter === status
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>

              {/* SEARCH */}

              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Enter Ticket ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setTicketPagination((prev) => ({
                      ...prev,
                      page: 1,
                    }));

                    setSearchTerm(e.target.value);
                  }}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 "
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden "
        >

          {/* TABLE SCROLL CONTAINER */}

          <div
            className="overflow-x-auto overflow-y-auto max-h-[70vh] md:max-h-[75vh] lg:max-h-[78vh]"
          >

            <Table
              columns={tableColumns}
              data={tickets}
              onRowClick={handleViewTicket}
              emptyMessage="No tickets found"
            />

          </div>

          {tickets.length > 0 && (
            <div
              className="border-t border-gray-200 px-3 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 "
            >

              {/* ========================= */}
              {/* LEFT SECTION */}
              {/* ========================= */}

              <div
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto"
              >

                {/* SHOWING TEXT */}

                <span
                  className="text-xs sm:text-sm text-gray-600 text-center sm:text-left"
                >

                  Showing{" "}

                  {
                    tickets.length > 0
                      ? (
                        (
                          ticketPagination.page - 1
                        ) * ticketPagination.limit
                      ) + 1
                      : 0
                  }

                  {" "}to{" "}

                  {
                    (
                      (
                        ticketPagination.page - 1
                      ) * ticketPagination.limit
                    ) + tickets.length
                  }

                  {" "}of{" "}

                  {
                    pagination.totalItems
                  }

                  {" "}tickets

                </span>

                {/* PAGE SIZE */}

                <div
                  className="flex items-center justify-center sm:justify-start gap-2"
                >

                  <label
                    className="text-xs sm:text-sm text-gray-600"
                  >
                    Items:
                  </label>

                  <select
                    value={ticketPagination.limit}
                    onChange={(e) =>
                      handleLimitChange(
                        Number(e.target.value)
                      )
                    }
                    className="px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm"
                  >

                    <option value={10}>
                      10
                    </option>

                    <option value={25}>
                      25
                    </option>

                    <option value={50}>
                      50
                    </option>

                  </select>

                </div>

              </div>

              {/* ========================= */}
              {/* RIGHT SECTION */}
              {/* ========================= */}

              <div
                className="flex flex-wrap items-center justify-center gap-2 w-full lg:w-auto"
              >

                {/* FIRST */}

                <button
                  onClick={() =>
                    handlePageChange(1)
                  }
                  disabled={
                    ticketPagination.page === 1
                  }
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 border rounded-lg disabled:opacity-50"
                >
                  First
                </button>

                {/* PREVIOUS */}

                <button
                  onClick={() =>
                    handlePageChange(
                      ticketPagination.page - 1
                    )
                  }
                  disabled={
                    ticketPagination.page === 1
                  }
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 borderrounded-lg  disabled:opacity-50"
                >
                  Prev
                </button>

                {/* PAGE INFO */}

                <span
                  className="xs sm:text-sm font-medium px-2 sm:px-3 whitespace-nowrap"
                >

                  Page{" "}
                  {
                    ticketPagination.page
                  }

                  {" "}of{" "}

                  {
                    Math.ceil(
                      pagination.totalItems /
                      ticketPagination.limit
                    )
                  }

                </span>

                {/* NEXT */}

                <button
                  onClick={() =>
                    handlePageChange(
                      ticketPagination.page + 1
                    )
                  }
                  disabled={
                    ticketPagination.page >=
                    Math.ceil(
                      pagination.totalItems /
                      ticketPagination.limit
                    )
                  }
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>

                {/* LAST */}

                <button
                  onClick={() =>
                    handlePageChange(
                      Math.ceil(
                        pagination.totalItems /
                        ticketPagination.limit
                      )
                    )
                  }
                  disabled={
                    ticketPagination.page >=
                    Math.ceil(
                      pagination.totalItems /
                      ticketPagination.limit
                    )
                  }
                    className="x-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 border rounded-lg disabled:opacity-50"
                >
                  Last
                </button>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
