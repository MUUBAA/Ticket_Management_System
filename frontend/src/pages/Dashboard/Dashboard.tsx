import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchTickets } from "../../store/slices/ticketSlice";
import {
  fetchUsers,
  fetchUserById,
  updateUser,
} from "../../store/slices/userSlice";
import StatCard from "../../components/common/StatCard/StatCard";
import PriorityBadge from "../../components/common/PriorityBadge/PriorityBadge";
import StatusBadge from "../../components/common/StatusBadge/StatusBadge";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Table, { type TableColumn } from "../../components/common/Table/Table";
import type { Ticket } from "../../types/ticket";
import type { UpdateUserRequest, User } from "../../types/user";
import { dashboardService } from "@/services/dashboardService";

const Dashboard: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState({
    status: "",

    sortOrder: "DESC",
  });

  const [
  slaMetrics,
  setSLAMetrics
] = useState({

  avgFirstResponseHours: 0,

  avgResolutionHours: 0,

  slaCompliance: 0,

  noDueDateCount: 0,

  overdueCount: 0,
});
  const {
    tickets = [],

    pagination = {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    },

    stats = {
      totalItems: 0,
      openCount: 0,
      closedCount: 0,
      onHoldCount: 0,
      inProgressCount: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    },
  } = useAppSelector((state) => state.tickets);
  const { users = [] } = useAppSelector((state) => state.users);

  const { user } = useAuth();

  const isSuperAdmin = user?.role === "SuperAdmin";

  const [showUserModal, setShowUserModal] = useState(false);

  const [isEditingUser, setIsEditingUser] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const canEditSelectedUser =
    isSuperAdmin || user?.userId === selectedUser?.userId;

  const [dashboardPagination, setDashboardPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [editUserData, setEditUserData] = useState<UpdateUserRequest>({
    name: "",
    email: "",
    companyName: "",
    empId: "",
    designation: "",
    reportTo: null,
  });

  const handleUserClick = async (userId: number) => {
    const result = await dispatch(fetchUserById(userId));

    if (fetchUserById.fulfilled.match(result)) {
      const user = result.payload;

      setSelectedUser(user);

      setEditUserData({
        name: user.name || "",
        email: user.email || "",
        companyName: user.companyName || "",
        empId: user.empId || "",
        designation: user.designation || "",
        reportTo: user.reportTo || null,
      });

      setIsEditingUser(false);
      setShowUserModal(true);
    }
  };

  const handleUpdateUser = async () => {
    if (!user?.userId || !selectedUser?.userId || !canEditSelectedUser) {
      return;
    }

    const result = await dispatch(
      updateUser({
        id: selectedUser.userId,

        data: editUserData,
      }),
    );

    if (updateUser.fulfilled.match(result)) {
      setIsEditingUser(false);

      setShowUserModal(false);

      dispatch(
        fetchUsers({
          page: 1,
          pageSize: 20,
        }),
      );
    }
  };

  const dashboardMetrics = React.useMemo(() => {
    return {
      totalTickets: stats.totalItems || 0,

      openTickets: stats.openCount || 0,

      inProgressTickets: stats.inProgressCount || 0,

      onHoldTickets: stats.onHoldCount || 0,

      closedTickets: stats.closedCount || 0,

      priorityBreakdown: {
        critical: stats.criticalCount || 0,

        high: stats.highCount || 0,

        medium: stats.mediumCount || 0,

        low: stats.lowCount || 0,
      },
    };
  }, [stats]);

  const tableColumns: TableColumn<Ticket>[] = [
    {
      key: "ticketId",
      label: "#",
      render: (value) => <>{`#${value}`}</>,
    },
    {
      key: "title",
      label: "Title",
      render: (value) => <>{value}</>,
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => <PriorityBadge priority={value as string} />,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      key: "assignedToName",
      label: "Assignee",
      render: (value) => (value ? <>{value as string}</> : "Unassigned"),
    },
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

  const handleRowClick = (row: Ticket) => {
    navigate(`/tickets/${row.ticketId}`);
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(
      pagination.totalItems / dashboardPagination.limit,
    );
    setDashboardPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(newPage, totalPages)),
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    setDashboardPagination(() => ({
      page: 1,
      limit: newLimit,
    }));
  };

  const fetchSLAMetrics =
    async () => {

      try {

        const data =
          await dashboardService
            .getSLAMetrics();

        setSLAMetrics(data);

      } catch (error) {

        console.error(
          "Failed to fetch SLA metrics",
          error
        );
      }
    };

  useEffect(() => {
    dispatch(
      fetchTickets({
        page: dashboardPagination.page,

        limit: dashboardPagination.limit,

        status: filters.status || undefined,
      }),
    );
  }, [
    dashboardPagination.page,

    dashboardPagination.limit,

    filters.status,

    dispatch,
  ]);

  useEffect(() => {

    fetchSLAMetrics();

  }, []);

  // =====================================
  // FETCH USERS
  // =====================================

  useEffect(() => {
    dispatch(
      fetchUsers({
        page: 1,

        pageSize: 20,
      }),
    );
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1700px] mx-auto px-6 xl:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6 xl:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Support Desk Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Overview of all tickets and team performance
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-sm sm:text-sm text-gray-600">
                Last updated:{" "}
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 xl:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Total Tickets"
            value={dashboardMetrics.totalTickets || 0}
            icon={
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            bgColor="bg-blue-50"
            textColor="text-blue-600"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Open Tickets"
            value={dashboardMetrics.openTickets || 0}
            icon={
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
            bgColor="bg-amber-50"
            textColor="text-amber-600"
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="In Progress"
            value={dashboardMetrics.inProgressTickets || 0}
            icon={
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            bgColor="bg-indigo-50"
            textColor="text-indigo-600"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="On Hold"
            value={dashboardMetrics.onHoldTickets || 0}
            icon={
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            bgColor="bg-gray-50"
            textColor="text-gray-600"
            trend={{ value: 3, isPositive: false }}
          />
          <StatCard
            title="Closed"
            value={dashboardMetrics.closedTickets || 0}
            icon={
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Priority Breakdown & SLA Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Priority Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Priority Breakdown
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Critical
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((dashboardMetrics.priorityBreakdown.critical || 0) /
                            Math.max(1, dashboardMetrics.totalTickets || 1)) *
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {dashboardMetrics.priorityBreakdown.critical || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    High
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((dashboardMetrics.priorityBreakdown.high || 0) /
                            Math.max(1, dashboardMetrics.totalTickets || 1)) *
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {dashboardMetrics.priorityBreakdown.high || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Medium
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((dashboardMetrics.priorityBreakdown.medium || 0) /
                            Math.max(1, dashboardMetrics.totalTickets || 1)) *
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {dashboardMetrics.priorityBreakdown.medium || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Low</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((dashboardMetrics.priorityBreakdown.low || 0) /
                            Math.max(1, dashboardMetrics.totalTickets || 1)) *
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {dashboardMetrics.priorityBreakdown.low || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SLA Metrics */}
        <div
  className="
    bg-white
    rounded-xl
    shadow-sm
    border
    border-gray-200
    p-4 sm:p-6
  "
>

  <h2
    className="
      text-base sm:text-lg
      font-semibold
      text-gray-900
      mb-4
    "
  >
    SLA Metrics
  </h2>

 <div
  className={`
    grid
    grid-cols-1
    sm:grid-cols-2
    ${
      isSuperAdmin
        ? "lg:grid-cols-5"
        : "lg:grid-cols-3"
    }
    gap-3 sm:gap-4
  `}
>

    {/* AVG FIRST RESPONSE */}

    <div
      className="
        text-center
        p-4
        bg-blue-50
        rounded-lg
      "
    >

      <div
        className="
          text-xl sm:text-2xl
          font-bold
          text-blue-600
          mb-1
        "
      >

        {
          slaMetrics
            .avgFirstResponseHours
        }h

      </div>

      <div
        className="
          text-xs sm:text-sm
          text-gray-600
        "
      >
        Avg First Response
      </div>

    </div>

    {/* AVG RESOLUTION */}

    <div
      className="
        text-center
        p-4
        bg-indigo-50
        rounded-lg
      "
    >

      <div
        className="
          text-xl sm:text-2xl
          font-bold
          text-indigo-600
          mb-1
        "
      >

        {
          slaMetrics
            .avgResolutionHours
        }h

      </div>

      <div
        className="
          text-xs sm:text-sm
          text-gray-600
        "
      >
        Avg Resolution
      </div>

    </div>

    {/* SLA COMPLIANCE */}

    <div
      className="
        text-center
        p-4
        bg-green-50
        rounded-lg
      "
    >

      <div
        className="
          text-xl sm:text-2xl
          font-bold
          text-green-600
          mb-1
        "
      >

        {
          slaMetrics
            .slaCompliance
        }%

      </div>

      <div
        className="
          text-xs sm:text-sm
          text-gray-600
        "
      >
        SLA Compliance
      </div>

    </div>

    {/* NO DUE DATE */}

    {isSuperAdmin && (

    <div
      className="
        text-center
        p-4
        bg-yellow-50
        rounded-lg
      "
    >

      <div
        className="
          text-xl sm:text-2xl
          font-bold
          text-yellow-600
          mb-1
        "
      >

        {
          slaMetrics
            .noDueDateCount
        }

      </div>

      <div
        className="
          text-xs sm:text-sm
          text-gray-600
        "
      >
        No Due Date
      </div>

    </div>

    )}
    {/* OVERDUE TICKETS */}

    {isSuperAdmin && (

    <div
      className="
        text-center
        p-4
        bg-red-50
        rounded-lg
      "
    >

      <div
        className="
          text-xl sm:text-2xl
          font-bold
          text-red-600
          mb-1
        "
      >

        {
          slaMetrics
            .overdueCount
        }

      </div>

      <div
        className="
          text-xs sm:text-sm
          text-gray-600
        "
      >
        Overdue Tickets
      </div>
    </div>
    )}

  </div>

</div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Tickets
              </h2>
              <div className=" flex items-center gap-2 flex-wrap overflow-x-auto pb-1">
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,

                      status: "",
                    })
                  }
                  className={`
      px-3 py-1.5 text-sm font-medium
      rounded-lg transition-colors duration-200

      ${filters.status === ""
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
    `}
                >
                  All
                </button>

                <button
                  onClick={() => {
                    setDashboardPagination((prev) => ({
                      ...prev,
                      page: 1,
                    }));

                    setFilters({
                      ...filters,

                      status: "Open",
                    });
                  }}
                  className={`
      px-3 py-1.5 text-sm font-medium
      rounded-lg transition-colors duration-200

      ${filters.status === "Open"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
    `}
                >
                  Open
                </button>

                <button
                  onClick={() => {
                    setDashboardPagination((prev) => ({
                      ...prev,
                      page: 1,
                    }));

                    setFilters({
                      ...filters,

                      status: "InProgress",
                    });
                  }}
                  className={`
      px-3 py-1.5 text-sm font-medium
      rounded-lg transition-colors duration-200

      ${filters.status === "InProgress"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
    `}
                >
                  In Progress
                </button>

                <button
                  onClick={() =>
                    setFilters({
                      ...filters,

                      status: "OnHold",
                    })
                  }
                  className={`
      px-3 py-1.5 text-sm font-medium
      rounded-lg transition-colors duration-200

      ${filters.status === "OnHold"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
    `}
                >
                  On Hold
                </button>

                <button
                  onClick={() => {
                    setDashboardPagination((prev) => ({
                      ...prev,
                      page: 1,
                    }));

                    setFilters({
                      ...filters,

                      status: "Closed",
                    });
                  }}
                  className={`
      px-3 py-1.5 text-sm font-medium
      rounded-lg transition-colors duration-200

      ${filters.status === "Closed"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
    `}
                >
                  Closed
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Table Wrapper */}
          <div className="overflow-y-auto overflow-x-auto max-h-96 border-t border-gray-200">
            <Table
              columns={tableColumns}
              data={tickets}
              onRowClick={handleRowClick}
              emptyMessage="No tickets found"
            />
          </div>

          {/* Pagination Controls */}
          {tickets.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                <span
                  className="
    text-sm
    text-gray-600
  "
                >

                  Showing{" "}

                  {
                    tickets.length > 0

                      ? (
                        (
                          dashboardPagination.page - 1
                        ) * dashboardPagination.limit
                      ) + 1

                      : 0
                  }

                  {" "}to{" "}

                  {
                    (
                      (
                        dashboardPagination.page - 1
                      ) * dashboardPagination.limit
                    ) + tickets.length
                  }

                  {" "}of{" "}

                  {
                    pagination.totalItems
                  }

                  {" "}tickets

                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <label htmlFor="limit" className="text-sm text-gray-600">
                    Items per page:
                  </label>
                  <select
                    id="limit"
                    value={dashboardPagination.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="px-2.5 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm w-20 sm:w-auto focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-start sm:justify-end">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={dashboardPagination.page === 1}
                  className="px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(dashboardPagination.page - 1)}
                  disabled={dashboardPagination.page === 1}
                  className="px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    {
                      length: Math.min(
                        5,
                        Math.ceil(
                          pagination.totalItems / dashboardPagination.limit,
                        ),
                      ),
                    },
                    (_, i) => {
                      const totalPages = Math.ceil(
                        pagination.totalItems / dashboardPagination.limit,
                      );
                      const pageNum =
                        Math.max(1, dashboardPagination.page - 2) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2.5 py-1 rounded-lg text-xs sm:px-3 sm:py-1.5 sm:text-sm font-medium transition-colors ${pageNum === dashboardPagination.page
                            ? "bg-indigo-600 text-white border border-indigo-600"
                            : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(dashboardPagination.page + 1)}
                  disabled={
                    dashboardPagination.page >=
                    Math.ceil(pagination.totalItems / dashboardPagination.limit)
                  }
                  className="px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={() =>
                    handlePageChange(
                      Math.ceil(
                        pagination.totalItems / dashboardPagination.limit,
                      ),
                    )
                  }
                  disabled={
                    dashboardPagination.page >=
                    Math.ceil(pagination.totalItems / dashboardPagination.limit)
                  }
                  className="px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Employee Workload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Team Workload
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Current ticket distribution across support team
            </p>
          </div>
          <div className="p-6">
            {users.length === 0 ? (
              <EmptyState
                icon={
                  <svg
                    className="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
                title="No team members assigned"
                description="Team members will appear here once tickets are assigned"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {users.map((employee: any) => (
                  <div
                    key={employee.userId}
                    onClick={() => handleUserClick(employee.userId)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-indigo-500 hover:-translate-y-1
  "
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {employee.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {employee.name || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Support Agent
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total</span>
                        <span className="font-semibold text-gray-900">
                          {employee.totalTickets || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Open</span>
                        <span className="font-semibold text-amber-600">
                          {employee.openCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">In Progress</span>
                        <span className="font-semibold text-indigo-600">
                          {employee.inProgressCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">On Hold</span>
                        <span className="font-semibold text-orange-600">
                          {employee.onHoldCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showUserModal && selectedUser && (
        <div
          className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        backdrop-blur-sm
        p-4
      "
        >
          <div
            className="
          bg-white
          rounded-3xl
          shadow-2xl
          w-full
          max-w-3xl
          overflow-hidden
        "
          >
            {/* HEADER */}

            <div
              className="
            bg-gradient-to-r
            from-indigo-600
            to-purple-600
            px-8
            py-6
            text-white
            flex
            items-center
            justify-between
          "
            >
              <div
                className="
              flex
              items-center
              gap-4
            "
              >
                <div
                  className="
                w-16
                h-16
                rounded-full
                bg-white/20
                flex
                items-center
                justify-center
                text-2xl
                font-bold
              "
                >
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2
                    className="
                  text-2xl
                  font-bold
                "
                  >
                    {selectedUser.name}
                  </h2>

                  <p
                    className="
                  text-indigo-100
                "
                  >
                    {selectedUser.designation || "User"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserModal(false);

                  setIsEditingUser(false);
                }}
                className="
              text-white
              text-3xl
            "
              >
                ×
              </button>
            </div>

            {/* BODY */}

            <div
              className="
            p-8
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
            >
              {[
                {
                  label: "Name",
                  key: "name",
                },

                {
                  label: "Email",
                  key: "email",
                },

                {
                  label: "Company",
                  key: "companyName",
                },

                {
                  label: "Employee ID",
                  key: "empId",
                },

                {
                  label: "Designation",
                  key: "designation",
                },
              ].map((field: any) => (
                <div
                  key={field.key}
                  className={field.key === "designation" ? "md:col-span-2" : ""}
                >
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-gray-700
                      mb-2
                    "
                  >
                    {field.label}
                  </label>

                  <input
                    type="text"
                    disabled={!isEditingUser}
                    value={(editUserData as any)[field.key] || ""}
                    onChange={(e) =>
                      setEditUserData((prev) => ({
                        ...prev,

                        [field.key]: e.target.value,
                      }))
                    }
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-gray-300
                      focus:ring-2
                      focus:ring-indigo-500
                      outline-none
                      disabled:bg-gray-100
                    "
                  />
                </div>
              ))}
            </div>

            {/* FOOTER */}

            <div
              className="
            px-8
            py-5
            border-t
            flex
            justify-end
            gap-4
            bg-gray-50
          "
            >
              <button
                onClick={() => {
                  setShowUserModal(false);

                  setIsEditingUser(false);
                }}
                className="
              px-5
              py-3
              rounded-xl
              border
              border-gray-300
              hover:bg-gray-100
            "
              >
                Close
              </button>

              {canEditSelectedUser ? (
                !isEditingUser ? (
                  <button
                    onClick={() => setIsEditingUser(true)}
                    className="
                    px-5
                    py-3
                    rounded-xl
                    bg-indigo-600
                    text-white
                    hover:bg-indigo-700
                  "
                  >
                    Edit User
                  </button>
                ) : (
                  <button
                    onClick={handleUpdateUser}
                    className="
                    px-5
                    py-3
                    rounded-xl
                    bg-green-600
                    text-white
                    hover:bg-green-700
                  "
                  >
                    Save Changes
                  </button>
                )
              ) : (
                <div className="text-sm text-gray-500 self-center">
                  Only this user or a SuperAdmin can edit these details.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
