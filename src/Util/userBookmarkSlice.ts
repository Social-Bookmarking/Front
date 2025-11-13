import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

type Tag = { tagId: number; tagName: string };

export interface UserBookmark {
  bookmarkId: number;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  categoryId: number;
  likesCount: number;
  tags: Tag[];
  liked: boolean;
}

interface CursorResponse<T> {
  content: T[];
  nextCursor: number | null;
  hasNext: boolean;
}

interface BookmarkListState {
  items: UserBookmark[];
  cursor: number | null;
  hasNext: boolean;
  loading: boolean;
}

interface UserBookmarkState {
  created: BookmarkListState;
  liked: BookmarkListState;
}

const initialListState: BookmarkListState = {
  items: [],
  cursor: null,
  hasNext: true,
  loading: false,
};

const initialState: UserBookmarkState = {
  created: { ...initialListState },
  liked: { ...initialListState },
};

export const fetchCreatedBookmarks = createAsyncThunk<
  CursorResponse<UserBookmark>,
  { cursor?: number | null; size?: number }
>('userBookmar/fetchCreated', async ({ cursor, size }) => {
  const { data } = await axios.get<CursorResponse<UserBookmark>>(
    'https://www.marksphere.link/api/me/bookmarks',
    {
      params: { cursor, size },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return data;
});

export const fetchLikedBookmarks = createAsyncThunk<
  CursorResponse<UserBookmark>,
  { cursor?: number | null; size?: number }
>('userBookmarks/fetchLiked', async ({ cursor, size }) => {
  const { data } = await axios.get<CursorResponse<UserBookmark>>(
    'https://www.marksphere.link/api/me/liked-bookmarks',
    {
      params: { cursor, size },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return data;
});

const userBookmarkSlice = createSlice({
  name: 'userBookmarks',
  initialState,
  reducers: {
    resetCreated(state) {
      state.created = { ...initialListState };
    },
    resetLiked(state) {
      state.liked = { ...initialListState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreatedBookmarks.pending, (state) => {
        state.created.loading = true;
      })
      .addCase(fetchCreatedBookmarks.fulfilled, (state, action) => {
        const { content, nextCursor, hasNext } = action.payload;

        const existingIds = new Set(
          state.created.items.map((b) => b.bookmarkId)
        );
        const newItems = content.filter((b) => !existingIds.has(b.bookmarkId));

        state.created.items = [...state.created.items, ...newItems];
        state.created.cursor = nextCursor ?? null;
        state.created.hasNext = hasNext;
        state.created.loading = false;
      })
      .addCase(fetchCreatedBookmarks.rejected, (state) => {
        state.created.loading = false;
      });
    builder
      .addCase(fetchLikedBookmarks.pending, (state) => {
        state.liked.loading = true;
      })
      .addCase(fetchLikedBookmarks.fulfilled, (state, action) => {
        const { content, nextCursor, hasNext } = action.payload;

        const existingIds = new Set(state.liked.items.map((b) => b.bookmarkId));
        const newItems = content.filter((b) => !existingIds.has(b.bookmarkId));

        state.liked.items = [...state.liked.items, ...newItems];
        state.liked.cursor = nextCursor ?? null;
        state.liked.hasNext = hasNext;
        state.liked.loading = false;
      })
      .addCase(fetchLikedBookmarks.rejected, (state) => {
        state.liked.loading = false;
      });
  },
});

export const { resetCreated, resetLiked } = userBookmarkSlice.actions;
export default userBookmarkSlice.reducer;
