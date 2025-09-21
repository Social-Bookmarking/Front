import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

type Tag = { tagId: number; tagName: string };

interface Bookmark {
  bookmarkId: number;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
  categoryId: number;
  likesCount: number;
  tags: Tag[];
  liked: boolean;
}

interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

interface BookmarkState {
  items: Bookmark[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
}

const initialState: BookmarkState = {
  items: [],
  loading: false,
  page: -1,
  totalPages: 0,
  totalElements: 0,
};

export const fetchBookmarksMap = createAsyncThunk<
  PageResponse<Bookmark>,
  {
    groupId: number | null;
    categoryId: number | null;
    page: number;
    keyword?: string;
  }
>('bookmarkMaps/fetch', async ({ groupId, categoryId, page, keyword }) => {
  if (categoryId === -1) {
    categoryId = null;
  }

  console.log('보내는 페이지', page);
  const { data } = await axios.get<PageResponse<Bookmark>>(
    `https://www.marksphere.link/api/groups/${groupId}/bookmarks/map`,
    {
      params: { page, categoryId, keyword },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  console.log(data);
  return data;
});

const bookmarMapSlice = createSlice({
  name: 'bookmarkMaps',
  initialState,
  reducers: {
    bookmarkMapreset(state) {
      state.items = [];
      state.loading = false;
      state.page = -1;
      state.totalPages = 0;
      state.totalElements = 0;
    },
    clearBookmarkLocation(state, action: PayloadAction<number>) {
      const bookmarkId = action.payload;
      const target = state.items.find((b) => b.bookmarkId === bookmarkId);
      if (target) {
        target.latitude = null;
        target.longitude = null;
        state.totalElements -= 1;
      }
    },
    // 새 북마크 추가
    addBookmarkToMap(state, action: PayloadAction<Bookmark>) {
      const exists = state.items.find(
        (b) => b.bookmarkId === action.payload.bookmarkId
      );
      if (exists) {
        const wasUnlocated =
          exists.latitude == null || exists.longitude == null;

        exists.latitude = action.payload.latitude;
        exists.longitude = action.payload.longitude;

        if (
          wasUnlocated &&
          exists.latitude != null &&
          exists.longitude != null
        ) {
          state.totalElements += 1;
        }
      } else {
        state.items.push(action.payload);
        state.totalElements += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarksMap.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookmarksMap.fulfilled, (state, action) => {
        const { content, pageNumber, totalPages, totalElements } =
          action.payload;
        if (pageNumber <= state.page) {
          state.loading = false;
          return;
        }

        state.items = [...state.items, ...content];
        state.page = pageNumber;
        state.totalPages = totalPages;
        state.totalElements = totalElements;
        state.loading = false;
      })
      .addCase(fetchBookmarksMap.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { bookmarkMapreset, clearBookmarkLocation, addBookmarkToMap } =
  bookmarMapSlice.actions;
export default bookmarMapSlice.reducer;
