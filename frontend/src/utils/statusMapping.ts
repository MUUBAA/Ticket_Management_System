import { TicketStatus } from '../types/ticket';

export interface StatusConfig {
  label: string;
  color: string;
  icon: string;
}

export const STATUS_MAPPING: Record<TicketStatus, StatusConfig> = {
  Open: {
    label: 'Open',
    color: 'blue',
    icon: '🔓',
  },
  InProgress: {
    label: 'In Progress',
    color: 'orange',
    icon: '⚙️',
  },
  OnHold: {
    label: 'On Hold',
    color: 'yellow',
    icon: '⏸️',
  },
  Closed: {
    label: 'Closed',
    color: 'gray',
    icon: '🔒',
  },
};

export const PRIORITY_MAPPING: Record<string, StatusConfig> = {
  Low: {
    label: 'Low',
    color: 'blue',
    icon: '🔵',
  },
  Medium: {
    label: 'Medium',
    color: 'orange',
    icon: '🟠',
  },
  High: {
    label: 'High',
    color: 'red',
    icon: '🔴',
  },
  Critical: {
    label: 'Critical',
    color: 'purple',
    icon: '🟣',
  },
};

export function getStatusConfig(status: TicketStatus): StatusConfig {
  return STATUS_MAPPING[status] || STATUS_MAPPING.Open;
}

export function getPriorityConfig(priority: string): StatusConfig {
  return PRIORITY_MAPPING[priority] || PRIORITY_MAPPING.Medium;
}

export function getStatusColor(status: TicketStatus): string {
  return STATUS_MAPPING[status]?.color || 'gray';
}

export function getPriorityColor(priority: string): string {
  return PRIORITY_MAPPING[priority]?.color || 'orange';
}
