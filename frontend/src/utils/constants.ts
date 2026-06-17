export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const STATUS_COLORS = {
  Open: 'blue',
  InProgress: 'orange',
  OnHold: 'yellow',
  Closed: 'gray',
};

export const PRIORITY_COLORS = {
  Low: 'blue',
  Medium: 'orange',
  High: 'red',
  Critical: 'purple',
};

export const TICKET_STATUS = ['Open', 'InProgress', 'OnHold', 'Closed'] as const;

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export const TICKET_TYPES = ['Support', 'Requirement', 'Repeat Ticket'] as const;

export const TICKET_CATEGORIES = ['Support', 'Requirement', 'Repeat Ticket'] as const; // Deprecated: use TICKET_TYPES

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPPORT: 'support',
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user',
};

export const TICKET_TYPE_OPTIONS = [
  { value: 'Support', label: 'Support' },
  { value: 'Requirement', label: 'Requirement' },
  { value: 'Repeat Ticket', label: 'Repeat Ticket' },
];

export const CATEGORY_OPTIONS = TICKET_TYPE_OPTIONS; // Deprecated: use TICKET_TYPE_OPTIONS

export const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];
