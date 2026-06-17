import React from 'react';
import { Ticket, TicketStatus } from '../types/ticket';
import Badge from './Badge';
import './TicketCard.css';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: (ticket: Ticket) => void;
  showActions?: boolean;
  onStatusChange?: (ticketId: number, status: TicketStatus) => void;
}

const statusToBadgeVariant: Record<TicketStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  Open: 'info',
  InProgress: 'warning',
  OnHold: 'warning',
  Closed: 'neutral',
};

const priorityToBadgeVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  Low: 'info',
  Medium: 'warning',
  High: 'danger',
  Critical: 'danger',
};

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onClick,
  showActions = false,
  onStatusChange,
}) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onStatusChange) {
      onStatusChange(ticket.ticketId, e.target.value as TicketStatus);
    }
  };

  const getStatusVariant = (): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    const status = ticket.status as TicketStatus;
    return statusToBadgeVariant[status] || 'neutral';
  };

  const getDescription = (): string => {
    if (!ticket.description) return '';
    const truncated = ticket.description.substring(0, 100);
    return ticket.description.length > 100 ? truncated + '...' : truncated;
  };

  return (
    <div className={`ticket-card ${onClick ? 'ticket-card-clickable' : ''}`} onClick={() => onClick?.(ticket)}>
      <div className="ticket-card-header">
        <span className="ticket-card-id">#{ticket.ticketId}</span>
        <Badge variant={getStatusVariant()} className="ticket-card-status">
          {ticket.status}
        </Badge>
      </div>
      
      <div className="ticket-card-title">
        {ticket.title}
      </div>
      
      <div className="ticket-card-description">
        {getDescription()}
      </div>
      
      <div className="ticket-card-meta">
        <div className="ticket-card-type">
          <span className="ticket-card-label">Type:</span>
          <span className="ticket-card-value">{ticket.ticketType}</span>
        </div>
        
        <div className="ticket-card-priority">
          <span className="ticket-card-label">Priority:</span>
          <Badge variant={priorityToBadgeVariant[ticket.priority]} className="ticket-card-priority-badge">
            {ticket.priority}
          </Badge>
        </div>
      </div>
      
      <div className="ticket-card-footer">
        <div className="ticket-card-assignee">
          <span className="ticket-card-label">Assignee:</span>
          <span className="ticket-card-value">
            {ticket.assignedToName || 'Unassigned'}
          </span>
        </div>
        
        <div className="ticket-card-date">
          <span className="ticket-card-label">Created:</span>
          <span className="ticket-card-value">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {showActions && onStatusChange && (
        <div className="ticket-card-actions">
          <select
            value={ticket.status}
            onChange={handleStatusChange}
            className="ticket-card-status-select"
          >
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="OnHold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
