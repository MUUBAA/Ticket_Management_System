import { Attachment } from "./attachment";

export interface Comment {
  commentId: number;
  ticketId: number;
  message: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  traceId: string;
   attachments?: Attachment[];
}

export interface CreateCommentRequest {
  ticketId: number;
  message: string;
  userName: string;
   attachments?: {
    base64: string;
    fileName: string;
    fileType: string;
  }[];
}

export interface UpdateCommentRequest {
  message: string;
  userName: string;
}
