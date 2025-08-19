import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Bookmark {
  categoryId: number;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  tagIds: number[];
  latitude: number;
  longitude: number;
  isFavorite: boolean;
}

interface BookmarkState {
  items: Bookmark[];
  loading: boolean;
}

const initialState: BookmarkState = {
  items: [],
  loading: false,
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
    reset(state) {
      state.items = [];
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchBookmarks.fulfilled,
        (state, action: PayloadAction<Bookmark[]>) => {
          // 새로 불러온 페이지는 이어 붙임
          state.items = [...state.items, ...action.payload];
          state.loading = false;
        }
      )
      .addCase(fetchBookmarks.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { reset } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
