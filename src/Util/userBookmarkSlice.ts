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

interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

interface UserBookmarkState {
  created: {
    items: UserBookmark[];
    page: number;
    totalPages: number;
    totalElements: number;
    loading: boolean;
  };
  liked: {
    items: UserBookmark[];
    page: number;
    totalPages: number;
    totalElements: number;
    loading: boolean;
  };
}

const initialState: UserBookmarkState = {
  created: {
    items: [],
    page: -1,
    totalPages: 0,
    totalElements: 0,
    loading: false,
  },
  liked: {
    items: [],
    page: -1,
    totalPages: 0,
    totalElements: 0,
    loading: false,
  },
};

export const fetchCreatedBookmarks = createAsyncThunk<
  PageResponse<UserBookmark>,
  number
>('userBookmar/fetchCreated', async (page) => {
  const { data } = await axios.get<PageResponse<UserBookmark>>(
    'https://www.marksphere.link/api/me/bookmarks',
    {
      params: { page },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return data;
});

export const fetchLikedBookmarks = createAsyncThunk<
  PageResponse<UserBookmark>,
  number
>('userBookmarks/fetchLiked', async (page) => {
  const { data } = await axios.get<PageResponse<UserBookmark>>(
    'https://www.marksphere.link/api/me/liked-bookmarks',
    {
      params: { page },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  console.log(data);
  return data;
});

const userBookmarkSlice = createSlice({
  name: 'userBookmarks',
  initialState,
  reducers: {
    resetCreated(state) {
      state.created = {
        items: [],
        page: -1,
        totalPages: 0,
        totalElements: 0,
        loading: false,
      };
    },
    resetLiked(state) {
      state.liked = {
        items: [],
        page: -1,
        totalPages: 0,
        totalElements: 0,
        loading: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreatedBookmarks.pending, (state) => {
        state.created.loading = true;
      })
      .addCase(fetchCreatedBookmarks.fulfilled, (state, action) => {
        const { content, pageNumber, totalPages, totalElements } =
          action.payload;
        if (pageNumber <= state.created.page) {
          state.created.loading = false;
          return;
        }
        state.created.items = [...state.created.items, ...content];
        state.created.page = pageNumber;
        state.created.totalPages = totalPages;
        state.created.totalElements = totalElements;
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
        const { content, pageNumber, totalPages, totalElements } =
          action.payload;
        if (pageNumber <= state.liked.page) {
          state.liked.loading = false;
          return;
        }
        state.liked.items = [...state.liked.items, ...content];
        state.liked.page = pageNumber;
        state.liked.totalPages = totalPages;
        state.liked.totalElements = totalElements;
        state.liked.loading = false;
      })
      .addCase(fetchLikedBookmarks.rejected, (state) => {
        state.liked.loading = false;
      });
  },
});

export const { resetCreated, resetLiked } = userBookmarkSlice.actions;
export default userBookmarkSlice.reducer;
