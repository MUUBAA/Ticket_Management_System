export type TicketStatus = 'Open' | 'InProgress' | 'OnHold' | 'Closed';

export interface Attachment {

  attachmentId: number;

  ticketId?: number;

  url?: string;

  base64Data?: string;

  fileName?: string;

  fileType?: string;

  createdAt: string;
}

export interface Ticket {

  ticketId: number;

  title: string;

  customerName?: string;

  employeeName?: string;

  projectName?: string;

  projectId?: number;

  assignedTo?: number;

  assignedToName?: string;

  ticketType: string;

  priority: string;

  description?: string;

  soNumber?: string;

  status: string;

  due_date?: string;

  createdAt: string;

  updatedAt: string;

  traceId: string;

  createdBy?: number;

  updatedBy?: number;
  createdByEmail?: string;

  createdByName?: string;

  attachments?: Attachment[];
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: string;
  ticketType: string;
  assignedTo?: string;
  companyName?: string;
  projectName?: string;
  soNumber?: string;
  due_date?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: string;
  ticketType?: string;
  assignedTo?: number;
  soNumber?: string;
  due_date?: string;
  projectName?: string;
  companyName?: string;
}

export interface TicketUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface TicketStats {

  totalItems: number;

  openCount: number;

  closedCount: number;

  onHoldCount: number;

  inProgressCount: number;

  criticalCount: number;

  highCount: number;

  mediumCount: number;

  lowCount: number;
}

export interface TicketListResponse {
  success: boolean;
  data: {
    tickets: Ticket[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
    stats: TicketStats ;
  };
}
