import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { commentService } from '../../services/commentService';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../../types/comment';

interface CommentState {
  comments: Comment[];
  ticketId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  ticketId: null,
  loading: false,
  error: null,
};

export const fetchComments = createAsyncThunk<Comment[], number>(
  'comments/fetchComments',
  async (ticketId, { rejectWithValue }) => {
    try {
      const comments = await commentService.getComments(ticketId);
      return comments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch comments');
    }
  }
);

export const createComment =
  createAsyncThunk(

    'comments/createComment',

    async (
      {
        ticketId,
        data,
        files,
        audioFile,
      }: {

        ticketId: number;

        data: CreateCommentRequest;

        files?: File[];
        audioFile?: File | null;
      },
      thunkAPI
    ) => {

      try {

        return await commentService.createComment(

          ticketId,

          data,

          files,

          audioFile
        );

      } catch (error: any) {

        return thunkAPI.rejectWithValue(
          error.response?.data ||
          'Failed to create comment'
        );
      }
    }
  );

export const updateComment = createAsyncThunk<Comment, { ticketId: number; commentId: number; data: UpdateCommentRequest }>(
  'comments/updateComment',
  async ({ ticketId, commentId, data }, { rejectWithValue }) => {
    try {
      const comment = await commentService.updateComment(ticketId, commentId, data);
      return comment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk<number, { ticketId: number; commentId: number }>(
  'comments/deleteComment',
  async ({ ticketId, commentId }, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(ticketId, commentId);
      return commentId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete comment');
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<{ ticketId: number; comments: Comment[] }>) => {
      state.ticketId = action.payload.ticketId;
      state.comments = action.payload.comments;
      state.error = null;
    },
    clearComments: (state) => {
      state.comments = [];
      state.ticketId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    removeComment: (state, action: PayloadAction<number>) => {
      state.comments = state.comments.filter(c => c.commentId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload);
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Comment
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.comments.findIndex(c => c.commentId === action.payload.commentId);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(c => c.commentId !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setComments, clearComments, clearError, removeComment } = commentSlice.actions;
export default commentSlice.reducer;
