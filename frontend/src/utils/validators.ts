import { TicketStatus } from '../types/ticket';
import { TICKET_STATUS, TICKET_PRIORITIES, TICKET_TYPES } from './constants';

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export const passwordRequirementsMessage =
  'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character';

export function validateEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return passwordRegex.test(password);
}

export function validateTicketStatus(status: string): status is TicketStatus {
  return TICKET_STATUS.includes(status as TicketStatus);
}

export function validatePriority(priority: string): boolean {
  return TICKET_PRIORITIES.includes(priority as any);
}

export function validateTicketType(ticketType: string): boolean {
  return TICKET_TYPES.includes(ticketType as any);
}

export function validateCategory(category: string): boolean {
  // Deprecated: use validateTicketType instead
  return validateTicketType(category);
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateLogin(email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = passwordRequirementsMessage;
  }

  return errors;
}

export function validateRegister(username: string, email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!username) {
    errors.username = 'Username is required';
  } else if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = passwordRequirementsMessage;
  }

  return errors;
}

export function validateTicketForm(data: {
  title?: string;
  description?: string;
  priority?: string;
  ticket_type?: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }

  if (!data.priority || !validatePriority(data.priority)) {
    errors.priority = 'Invalid priority';
  }

  if (!data.ticket_type || !validateTicketType(data.ticket_type)) {
    errors.ticket_type = 'Invalid ticket type';
  }

  return errors;
}

export function validateComment(content: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!content || content.trim().length === 0) {
    errors.content = 'Comment content is required';
  } else if (content.length < 5) {
    errors.content = 'Comment must be at least 5 characters';
  }

  return errors;
}
