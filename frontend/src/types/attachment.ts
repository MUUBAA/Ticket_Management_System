export interface Attachment {
  attachmentId: number;
  ticketId?: number;
  url?: string;
  base64Data?: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
  commentId?: number;
}

export interface CreateAttachmentRequest {
  url?: string;
  base64?: string;
  fileName?: string;
  fileType?: string;
}
