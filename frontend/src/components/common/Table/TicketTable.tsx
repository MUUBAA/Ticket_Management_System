import React from 'react';
import { format } from 'date-fns';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface TicketTableRow {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
}

interface TicketTableProps {
  tickets: TicketTableRow[];
  onRowClick?: (ticketId: number) => void;
  isLoading?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Open: { bg: 'bg-blue-100', text: 'text-blue-700' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  InProgress: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  onhold: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  OnHold: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  Closed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  Assigned: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const priorityConfig: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  urgent: { bg: 'bg-red-100', text: 'text-red-700' },
};

const TicketTable: React.FC<TicketTableProps> = ({ tickets, onRowClick, isLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8">
                  <div className="flex flex-col items-center justify-center py-6">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium">No tickets yet</p>
                    <p className="text-sm text-gray-400">Create your first ticket to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => onRowClick?.(ticket.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                          <span className="text-xs font-semibold text-indigo-600">{ticket.id}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {ticket.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {statusConfig[ticket.status] ? (
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          statusConfig[ticket.status].bg
                        } ${statusConfig[ticket.status].text}`}
                      >
                        {ticket.status}
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {ticket.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {priorityConfig[ticket.priority] ? (
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          priorityConfig[ticket.priority].bg
                        } ${priorityConfig[ticket.priority].text}`}
                      >
                        {ticket.priority}
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {ticket.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 inline-block" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;
