import api from './api';

import {
  Comment,
  CreateCommentRequest,
} from '../types/comment';

interface CommentApiResponse {
  success: boolean;
  data: Comment[];
}

interface SingleCommentApiResponse {
  success: boolean;
  data: Comment;
}

const fileToBase64 = (
  file: File
): Promise<string> => {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {

        const result =
          reader.result as string;

        const base64 =
          result.split(",")[1];

        resolve(base64);
      };

      reader.onerror =
        reject;
    }
  );
};

export const commentService = {

  

  // =====================================
  // GET COMMENTS
  // =====================================

  async getComments(
    ticketId: number
  ): Promise<Comment[]> {

    const response =
      await api.get<CommentApiResponse>(
        `/tickets/${ticketId}/comments`
      );

    return response.data || [];
  },

  // =====================================
  // CREATE COMMENT
  // =====================================

  async createComment(
  ticketId: number,
  data: CreateCommentRequest,
  files?: File[],
  audioFile?: File | null
): Promise<Comment> {

  let attachments:
    {
      url?: string;
      base64: string;
      fileName: string;
      fileType: string;
    }[] = [];

  // =========================
  // NORMAL FILES
  // =========================

  if (
    files &&
    files.length > 0
  ) {

    const fileAttachments =
      await Promise.all(

        files.map(
          async (file) => {

            const base64 =
              await fileToBase64(
                file
              );

            return {

              url: "",

              base64,

              fileName:
                file.name,

              fileType:
                file.type,
            };
          }
        )
      );

    attachments.push(
      ...fileAttachments
    );
  }

  // =========================
  // AUDIO FILE
  // =========================

  if (audioFile) {

    const base64 =
      await fileToBase64(
        audioFile
      );

    attachments.push({

      url: "",

      base64,

      fileName:
        audioFile.name,

      fileType:
        audioFile.type,
    });
  }

  // =========================
  // FINAL PAYLOAD
  // =========================

  const payload = {

    ...data,

    attachments,
  };

  console.log(
    'COMMENT PAYLOAD:',
    payload
  );

  const response =
    await api.post<
      SingleCommentApiResponse
    >(
      `/tickets/${ticketId}/comments`,
      payload
    );

  return response.data;
},
  // =====================================
  // UPDATE COMMENT
  // =====================================

  async updateComment(
    ticketId: number,
    commentId: number,
    data: Partial<CreateCommentRequest>
  ): Promise<Comment> {

    const response =
      await api.put<SingleCommentApiResponse>(
        `/tickets/${ticketId}/comments/${commentId}`,
        data
      );

    return response.data;
  },

  // =====================================
  // DELETE COMMENT
  // =====================================

  async deleteComment(
    ticketId: number,
    commentId: number
  ): Promise<void> {

    await api.delete(
      `/tickets/${ticketId}/comments/${commentId}`
    );
  },
};