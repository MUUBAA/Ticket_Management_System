import React, { useEffect, useState } from "react";
import { useTicket } from "../../hooks/useTicket";
import { ticketService } from "../../services/ticketService";
import { Ticket } from "../../types/ticket";
import TicketDetailModal from "../../components/common/TicketDetailModal/TicketDetailModal";
import { FiDownload } from "react-icons/fi";
import { useAppDispatch, useAppSelector, useAuth } from "../../hooks/useAuth";
import { companyService } from "../../services/companyService";
import "./Reports.css";
import { Company } from "@/types/company";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { fetchCompanyUsers } from "../../store/slices/userSlice";

interface PaginationState {
  page: number;
  limit: number;
  totalItems: number;
}

const Reports: React.FC = () => {
  const {
    tickets,

    loading,

    error,

    pagination,

    fetchTickets,
  } = useTicket();
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    status: "",

    priority: "",

    ticketType: "",

    ticketId: "",

    customerName: "",

    companyName: "",

    projectName: "",

    assignedTo: "",

    search: "",

    fromDate: "",

    toDate: "",

    sortOrder: "DESC" as "ASC" | "DESC",
  });

  const [debouncedTicketId, setDebouncedTicketId] = useState("");

  const { user } = useAuth();

  const isSuperAdmin = user?.role === "SuperAdmin";

  const dispatch =
    useAppDispatch();

  const {
    companyUsers,
  } = useAppSelector(
    (state) => state.users
  );

  const [companies, setCompanies] = useState<Company[]>([]);

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleRowClick = (ticketId: number) => {
    setSelectedTicketId(ticketId);
  };

  // Fetch tickets on mount or when pagination/filters change
  useEffect(() => {
    const loadTickets = async () => {
      try {
        await fetchTickets({
          page: localPagination.page,

          limit: localPagination.limit,

          status: filters.status || undefined,

          priority: filters.priority || undefined,

          ticketId:
            debouncedTicketId.trim() !== ""
              ? Number(debouncedTicketId)
              : undefined,

          customerName: filters.customerName || undefined,

          companyName: filters.companyName || undefined,

          assignedTo:
            filters.assignedTo
              ? Number(filters.assignedTo)
              : undefined,

          fromDate:
            filters.fromDate || undefined,

          toDate:
            filters.toDate || undefined,

          sortBy: "ticket_id",

          sortOrder: filters.sortOrder,
        });
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    };

    loadTickets();
  }, [

    localPagination.page,

    localPagination.limit,

    filters.status,

    filters.priority,

    filters.customerName,

    filters.companyName,

    filters.assignedTo,

    filters.sortOrder,

    debouncedTicketId,

    filters.fromDate,

    filters.toDate,

    fetchTickets,
  ]);

  useEffect(() => {

    if (isSuperAdmin) {

      dispatch(
        fetchCompanyUsers()
      );
    }

  }, [
    dispatch,
    isSuperAdmin,
  ]);

  // Update pagination from Redux
  useEffect(() => {
    if (pagination) {
      setLocalPagination({
        page: pagination.page,
        limit: pagination.limit,
        totalItems: pagination.totalItems,
      });
    }
  }, [pagination]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companyService.getCompanies();

        setCompanies(data);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTicketId(filters.ticketId);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.ticketId]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setLocalPagination((prev) => ({
      ...prev,
      page: Math.max(
        1,
        Math.min(
          newPage,
          Math.ceil(localPagination.totalItems / localPagination.limit),
        ),
      ),
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    setLocalPagination((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);

      const blob = await ticketService.exportTickets({
        page: 1,
        limit: 10000, // Export all filtered tickets

        status: filters.status || undefined,

        priority: filters.priority || undefined,

        ticketType: filters.ticketType || undefined,

        ticketId: filters.ticketId ? Number(filters.ticketId) : undefined,

        customerName: filters.customerName || undefined,

        companyName: filters.companyName || undefined,

        projectName: filters.projectName || undefined,

        assignedTo:
          filters.assignedTo
            ? Number(filters.assignedTo)
            : undefined,

        search: filters.search || undefined,

        fromDate: filters.fromDate || undefined,

        toDate: filters.toDate || undefined,

        sortBy: "ticket_id",

        sortOrder: filters.sortOrder,
      });

      // =====================================
      // CREATE DOWNLOAD LINK
      // =====================================

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `tickets_report_${new Date().toISOString().split("T")[0]
        }.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);

      alert("Failed to export tickets");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(
    localPagination.totalItems / localPagination.limit,
  );

  const priorityColors: Record<string, string> = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800",
  };

  const statusColors: Record<string, string> = {
    Open: "bg-blue-100 text-blue-800",
    InProgress: "bg-cyan-100 text-cyan-800",
    OnHold: "bg-yellow-100 text-yellow-800",
    Closed: "bg-gray-100 text-gray-800",
  };

  {
    /* ERROR STATE */
  }

  {
    !loading && error && (
      <div
        className="
        error-container
      "
      >
        <div
          className="
          error-alert
        "
        >
          <div
            className="
            error-icon
          "
          >
            ⚠️
          </div>

          <div>
            <h3>Failed to Load Tickets</h3>

            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Ticket Reports</h1>
        <button
          onClick={exportToExcel}
          className="export-btn"
          disabled={exporting}
        >
          <>
            <FiDownload className="text-lg" />

            <span>{exporting ? "Exporting..." : "Export to Excel"}</span>
          </>
        </button>
      </div>

      {/* Filters */}
      <div className="reports-filters">
        <div className="filter-group">
          <label htmlFor="ticketId">Ticket ID</label>

          <div className="relative flex items-center">
            <input
              type="text"
              id="ticketId"
              name="ticketId"
              placeholder="Enter Ticket ID..."
              value={filters.ticketId}
              onChange={handleFilterChange}
              className="
        filter-input
        pr-12
      "
            />
          </div>
        </div>
{/* 
        {isSuperAdmin && (
          <div className="filter-group">
            <label htmlFor="customerName">Customer Name</label>

            <input
              type="text"
              id="customerName"
              name="customerName"
              placeholder="Enter Customer Name..."
              value={filters.customerName}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
        )} */}

        {isSuperAdmin && (
          <div className="filter-group">
            <label htmlFor="companyName">Company Name</label>

            <select
              id="companyName"
              name="companyName"
              value={filters.companyName}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Companies</option>

              {companies.map((company) => (
                <option value={company.companyName}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>
        )}

        {
          isSuperAdmin && (

            <div className="filter-group">

              <label htmlFor="assignedTo">
                Assigned To
              </label>

              <select
                id="assignedTo"
                name="assignedTo"
                value={filters.assignedTo}
                onChange={handleFilterChange}
                className="filter-select"
              >

                <option value="">
                  All Employees
                </option>

                {
                  companyUsers.map((user) => (

                    <option
                      key={user.userId}
                      value={user.userId}
                    >
                      {user.name}
                    </option>
                  ))
                }

              </select>

            </div>
          )
        }

        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="OnHold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="filter-group">

          <label htmlFor="fromDate">
            From Date
          </label>

          <input
            type="date"
            id="fromDate"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group">

          <label htmlFor="toDate">
            To Date
          </label>

          <input
            type="date"
            id="toDate"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>

        <button
          onClick={() => {
            setFilters({
              status: "",
              priority: "",
              ticketType: "",
              ticketId: "",
              customerName: "",
              companyName: "",
              projectName: "",
              assignedTo: "",
              search: "",
              fromDate: "",
              toDate: "",
              sortOrder: "DESC",
            });
            setLocalPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="reset-filters-btn"
        >
          Reset Filters
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tickets...</p>
        </div>
      )}

      {/* ERROR STATE */}

      {
        !loading &&
        error &&
        debouncedTicketId.trim() !== "" && (

          <div
            className="
        error-container
      "
          >

            <div
              className="
          error-alert
        "
            >

              <div
                className="
            error-icon
          "
              >
                ⚠️
              </div>

              <div>

                <h3>
                  Failed to Load Tickets
                </h3>

                <p>
                  {error}
                </p>

              </div>

            </div>

          </div>
        )
      }

      {/* Empty State */}
      {!loading && !error && tickets.length === 0 && (
        <div className="empty-state">
          <p>No tickets found matching your filters.</p>
        </div>
      )}

      {/* Table */}
      {!loading && tickets.length > 0 && (
        <>
          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th className="sortable">
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,

                          sortOrder: prev.sortOrder === "ASC" ? "DESC" : "ASC",
                        }))
                      }
                      className="
      flex
      items-center
      gap-2
      font-semibold
      hover:text-indigo-600
      transition-colors
    "
                    >
                      <span>Ticket ID</span>

                      {filters.sortOrder === "ASC" ? (
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
                  </th>
                  <th className="sortable">Title</th>
                  <th className="sortable">Status</th>
                  <th className="sortable">Priority</th>
                  <th>Type</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th className="sortable">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket: Ticket) => (
                  <tr
                    key={ticket.ticketId}
                    onClick={() => handleRowClick(ticket.ticketId)}
                    className="table-row cursor-pointer  hover:bg-indigo-50 transition-colors"
                  >
                    <td className="ticket-id">#{ticket.ticketId}</td>
                    <td className="ticket-title">{ticket.title}</td>
                    <td>
                      <span
                        className={`badge ${statusColors[ticket.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${priorityColors[ticket.priority] || "bg-gray-100 text-gray-800"}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td>{ticket.ticketType}</td>
                    <td>{ticket.projectName || "-"}</td>
                    <td>{ticket.assignedToName || "-"}</td>
                    <td className="date">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              <span>
                Showing{" "}

                {
                  tickets.length > 0

                    ? (
                      (localPagination.page - 1) *
                      localPagination.limit
                    ) + 1

                    : 0
                }

                {" "}to{" "}

                {
                  (
                    (localPagination.page - 1) *
                    localPagination.limit
                  ) + tickets.length
                }

                {" "}of{" "}

                {
                  localPagination.totalItems
                }

                {" "}tickets
              </span>

              <div className="limit-selector">
                <label htmlFor="limit">Items per page:</label>
                <select
                  id="limit"
                  value={localPagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="limit-select"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(1)}
                disabled={localPagination.page === 1}
                className="pagination-btn"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(localPagination.page - 1)}
                disabled={localPagination.page === 1}
                className="pagination-btn"
              >
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, localPagination.page - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`page-btn ${pageNum === localPagination.page ? "active" : ""}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(localPagination.page + 1)}
                disabled={localPagination.page >= totalPages}
                className="pagination-btn"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={localPagination.page >= totalPages}
                className="pagination-btn"
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
};

export default Reports;
