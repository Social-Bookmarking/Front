import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface Author {
  userId: number;
  nickname: string;
  profileImageUrl: string;
}

export interface Comment {
  commentId: number;
  content: string;
  author: Author;
  createdAt: string;
  replyCount: number;
}

export interface Reply extends Comment {
  parentAuthorNickname: string;
}

interface CommentsByBookmark {
  data: Comment[];
  nextCursor: number | null;
  hasNext: boolean;
  loading: boolean;
  error: string | null;
}

interface RepliesByComment {
  data: Reply[];
  nextCursor: number | null;
  hasNext: boolean;
  loading: boolean;
  error: string | null;
}

interface CommentState {
  commentsByBookmark: Record<number, CommentsByBookmark>;
  repliesByComment: Record<number, RepliesByComment>;
}

const initialState: CommentState = {
  commentsByBookmark: {},
  repliesByComment: {},
};

// 최상위 댓글 조회
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ bookmarkId, cursor }: { bookmarkId: number; cursor?: number }) => {
    const { data } = await axios.get(
      `https://www.marksphere.link/api/bookmarks/${bookmarkId}/comments`,
      {
        params: { cursor, size: 10 },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    console.log(data);
    return { bookmarkId, ...data, cursor };
  }
);

// 답글 조회
export const fetchReplies = createAsyncThunk(
  'comments/fetchReplies',
  async ({ commentId, cursor }: { commentId: number; cursor?: number }) => {
    const { data } = await axios.get(
      `https://www.marksphere.link/api/comments/${commentId}/replies`,
      {
        params: { cursor, size: 10 },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    console.log(data);
    return { commentId, ...data, cursor };
  }
);

// 댓글/답글 작성
export const addComment = createAsyncThunk(
  'comments/addComment',
  async (
    {
      bookmarkId,
      content,
      parentId,
      rootCommentId,
      isLastPage,
    }: {
      bookmarkId: number;
      content: string;
      parentId?: number | null;
      rootCommentId?: number;
      isLastPage?: boolean;
    },
    { dispatch }
  ) => {
    const res = await axios.post(
      `https://www.marksphere.link/api/bookmarks/${bookmarkId}/comments`,
      { content, ...(parentId ? { parentId } : {}) },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Idempotency-Key': crypto.randomUUID(),
        },
      }
    );

    const data = res.data;

    if (parentId && isLastPage && rootCommentId) {
      dispatch(addReplyLocal({ rootCommentId, reply: data }));
    } else if (!parentId && isLastPage) {
      dispatch(addCommentLocal({ bookmarkId, comment: data }));
    }

    return { bookmarkId, parentId, rootCommentId };
  }
);

// 댓글 삭제
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({
    commentId,
    bookmarkId,
    parentId,
  }: {
    commentId: number;
    bookmarkId: number;
    parentId?: number | null;
  }) => {
    await axios.delete(
      `https://www.marksphere.link/api/comments/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    return { commentId, bookmarkId, parentId };
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    resetComments(state, action) {
      const bookmarkId = action.payload;
      state.commentsByBookmark[bookmarkId] = {
        data: [],
        nextCursor: null,
        hasNext: true,
        loading: false,
        error: null,
      };
    },
    resetReplies(state, action) {
      const commentId = action.payload;
      state.repliesByComment[commentId] = {
        data: [],
        nextCursor: null,
        hasNext: true,
        loading: false,
        error: null,
      };
    },
    addCommentLocal(state, action) {
      const { bookmarkId, comment } = action.payload;
      const commentState = state.commentsByBookmark[bookmarkId];
      if (commentState) {
        commentState.data = [...commentState.data, comment];
      } else {
        state.commentsByBookmark[bookmarkId] = {
          data: [comment],
          nextCursor: null,
          hasNext: true,
          loading: false,
          error: null,
        };
      }
    },
    addReplyLocal(state, action) {
      const { rootCommentId, reply } = action.payload;
      const replyState = state.repliesByComment[rootCommentId];
      if (replyState) {
        replyState.data = [...replyState.data, reply];
      } else {
        state.repliesByComment[rootCommentId] = {
          data: [reply],
          nextCursor: null,
          hasNext: true,
          loading: false,
          error: null,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 댓글 조회
      .addCase(fetchComments.pending, (state, action) => {
        const { bookmarkId } = action.meta.arg;
        if (!state.commentsByBookmark[bookmarkId]) {
          state.commentsByBookmark[bookmarkId] = {
            data: [],
            nextCursor: null,
            hasNext: true,
            loading: true,
            error: null,
          };
        } else {
          state.commentsByBookmark[bookmarkId].loading = true;
        }
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { bookmarkId, content, nextCursor, hasNext, cursor } =
          action.payload;
        const prev = state.commentsByBookmark[bookmarkId]?.data ?? [];

        const isFirstLoad = !cursor;

        state.commentsByBookmark[bookmarkId] = {
          data: isFirstLoad ? content : [...prev, ...content],
          nextCursor,
          hasNext,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const { bookmarkId } = action.meta.arg;
        state.commentsByBookmark[bookmarkId] = {
          data: [],
          nextCursor: null,
          hasNext: false,
          loading: false,
          error: action.error.message ?? '댓글 조회 실패',
        };
      })

      // 답글 조회
      .addCase(fetchReplies.pending, (state, action) => {
        const { commentId } = action.meta.arg;
        if (!state.repliesByComment[commentId]) {
          state.repliesByComment[commentId] = {
            data: [],
            nextCursor: null,
            hasNext: true,
            loading: true,
            error: null,
          };
        } else {
          state.repliesByComment[commentId].loading = true;
        }
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        const { commentId, content, nextCursor, hasNext, cursor } =
          action.payload;
        const prev = state.repliesByComment[commentId]?.data ?? [];

        const isFirstLoad = !cursor;

        state.repliesByComment[commentId] = {
          data: isFirstLoad ? content : [...prev, ...content],
          nextCursor,
          hasNext,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchReplies.rejected, (state, action) => {
        const { commentId } = action.meta.arg;
        state.repliesByComment[commentId] = {
          data: [],
          nextCursor: null,
          hasNext: false,
          loading: false,
          error: action.error.message ?? '답글 조회 실패',
        };
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId, bookmarkId, parentId } = action.payload;

        if (parentId) {
          const replyState = state.repliesByComment[parentId];
          if (replyState) {
            replyState.data = replyState.data.filter(
              (r) => r.commentId !== commentId
            );
          }
          const comments = state.commentsByBookmark[bookmarkId]?.data ?? [];
          const parent = comments.find((c) => c.commentId === parentId);
          if (parent) parent.replyCount = Math.max(0, parent.replyCount - 1);
        } else {
          const commentState = state.commentsByBookmark[bookmarkId];
          if (commentState) {
            commentState.data = commentState.data.filter(
              (c) => c.commentId !== commentId
            );
          }
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { bookmarkId, rootCommentId } = action.payload;
        if (rootCommentId) {
          const comments = state.commentsByBookmark[bookmarkId]?.data ?? [];
          const root = comments.find((c) => c.commentId === rootCommentId);
          if (root) {
            root.replyCount += 1;
          }
        }
      });
  },
});

export const { resetComments, resetReplies, addCommentLocal, addReplyLocal } =
  commentSlice.actions;
export default commentSlice.reducer;
