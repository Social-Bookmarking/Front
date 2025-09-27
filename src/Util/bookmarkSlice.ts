import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { fetchCategories } from './categorySlice';
import axios from 'axios';

type Tag = { tagId: number; tagName: string };

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
  uiPage: number;
  totalPages: number;
  totalElements: number;
}

const initialState: BookmarkState = {
  items: [],
  loading: false,
  page: -1,
  uiPage: 1,
  totalPages: 0,
  totalElements: 0,
};

export const fetchBookmarks = createAsyncThunk<
  PageResponse<Bookmark>,
  {
    groupId: number | null;
    categoryId: number | null;
    page: number;
    keyword?: string;
  }
>('bookmarks/fetch', async ({ groupId, categoryId, page, keyword }) => {
  if (categoryId === -1) {
    categoryId = null;
  }

  console.log('북마크 보내는 페이지', page);
  const { data } = await axios.get<PageResponse<Bookmark>>(
    `https://www.marksphere.link/api/groups/${groupId}/bookmarks`,
    {
      params: { page, categoryId, keyword },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  console.log('북마크', data);
  return data;
});

export const updateBookmark = createAsyncThunk<
  Bookmark,
  Partial<Bookmark> & { bookmarkId: number }
>('bookmarks/update', async ({ bookmarkId, ...updates }) => {
  const { data } = await axios.patch<Bookmark>(
    `https://www.marksphere.link/api/bookmarks/${bookmarkId}`,
    updates,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  console.log(data);
  return data;
});

export const deleteBookmark = createAsyncThunk<
  number,
  { bookmarkId: number; groupId: number | null }
>('bookmarks/delete', async ({ bookmarkId, groupId }, { dispatch }) => {
  await axios.delete(
    `https://www.marksphere.link/api/bookmarks/${bookmarkId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  await dispatch(fetchCategories(groupId));

  return bookmarkId;
});

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    reset(state) {
      state.items = [];
      state.loading = false;
      state.page = -1;
      state.uiPage = 1;
      state.totalPages = 0;
      state.totalElements = 0;
    },
    nextUiPage(state, action: PayloadAction<number>) {
      state.uiPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        // 임시로 만든 코드
        const { content, pageNumber, totalPages, totalElements } =
          action.payload;
        // 이미 로드된 페이지는 다시 추가하지 않음
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
      .addCase(fetchBookmarks.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteBookmark.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (b) => b.bookmarkId !== action.payload
        );
      })
      .addCase(updateBookmark.fulfilled, (state, action) => {
        const { bookmarkId, latitude, longitude } = action.payload;
        const target = state.items.find((b) => b.bookmarkId === bookmarkId);
        if (target) {
          target.latitude = latitude;
          target.longitude = longitude;
        }
      });
  },
});

export const { reset, nextUiPage } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
