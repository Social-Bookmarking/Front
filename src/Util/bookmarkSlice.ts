import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

type tag = { tagId: number; tagName: string };

export interface Bookmark {
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
  tagIds: tag[];
  liked: boolean;
}

interface BookmarkState {
  items: Bookmark[];
  loading: boolean;
  page: number;
}

const initialState: BookmarkState = {
  items: [],
  loading: false,
  page: 0,
};

// 나중에 수정해야 함.
export const fetchBookmarks = createAsyncThunk<Bookmark[], number>(
  'bookmarks/fetch',
  async (page: number) => {
    const { data } = await axios.get<Bookmark[]>(`/api/bookmarks`, {
      params: { page },
    });
    return data;
  }
);

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    updateBookmarkLocation: (
      state,
      action: PayloadAction<{
        bookmarkId: number;
        latitude: number;
        longitude: number;
      }>
    ) => {
      const { bookmarkId, latitude, longitude } = action.payload;
      const target = state.items.find((b) => b.bookmarkId === bookmarkId);
      if (target) {
        target.latitude = latitude;
        target.longitude = longitude;
      }
    },
    reset(state) {
      state.items = [];
      state.loading = false;
      state.page = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        // 임시로 만든 코드
        const fetchedPage = action.meta.arg;
        // 이미 로드된 페이지는 다시 추가하지 않음
        if (fetchedPage <= state.page) {
          state.loading = false;
          return;
        }

        state.items = [...state.items, ...action.payload];
        state.page = fetchedPage;
        state.loading = false;
      })
      .addCase(fetchBookmarks.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { reset, updateBookmarkLocation } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
