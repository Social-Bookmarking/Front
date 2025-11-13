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

interface CursorResponse<T> {
  content: T[];
  nextCursor: number | null;
  hasNext: boolean;
}

interface BookmarkState {
  items: Bookmark[];
  loading: boolean;
  cursor: number | null;
  hasNext: boolean;
}

const initialState: BookmarkState = {
  items: [],
  loading: false,
  cursor: null,
  hasNext: true,
};

export const fetchBookmarks = createAsyncThunk<
  CursorResponse<Bookmark>,
  {
    groupId: number | null;
    categoryId?: number | null;
    cursor?: number | null;
    keyword?: string;
    tagId?: number | null;
    size?: number;
  }
>(
  'bookmarks/fetch',
  async ({ groupId, categoryId, cursor, keyword, tagId, size }) => {
    if (categoryId === -1) {
      categoryId = null;
    }

    const { data } = await axios.get<CursorResponse<Bookmark>>(
      `https://www.marksphere.link/api/groups/${groupId}/bookmarks`,
      {
        params: { categoryId, keyword, tagId, cursor, size },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    console.log(data);
    return data;
  }
);

export const updateBookmark = createAsyncThunk<
  Partial<Bookmark> & {
    bookmarkId: number;
    tagNames?: string[];
    imageKey?: string;
    previewUrl?: string;
  },
  Partial<Bookmark> & {
    bookmarkId: number;
    tagNames?: string[];
    imageKey?: string;
    previewUrl?: string;
  }
>('bookmarks/update', async ({ bookmarkId, previewUrl, ...updates }) => {
  await axios.patch(
    `https://www.marksphere.link/api/bookmarks/${bookmarkId}`,
    updates,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  // 서버는 응답을 안 주므로, 우리가 보낸 값 그대로 반환
  return { bookmarkId, ...updates, previewUrl };
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
      state.cursor = null;
      state.hasNext = true;
    },
    addBookmark(state, action: PayloadAction<Bookmark>) {
      const exists = state.items.some(
        (b) => b.bookmarkId === action.payload.bookmarkId
      );
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        const { content, nextCursor, hasNext } = action.payload;

        // 커서 중복 방지
        const existingIds = new Set(state.items.map((b) => b.bookmarkId));
        const newItems = content.filter((b) => !existingIds.has(b.bookmarkId));

        state.items = [...state.items, ...newItems];
        state.cursor = nextCursor ?? null;
        state.hasNext = hasNext;
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
        const { bookmarkId, tagNames, imageKey, ...updates } = action.payload;
        const target = state.items.find((b) => b.bookmarkId === bookmarkId);
        if (target) {
          Object.assign(target, updates);
          let count = 0;
          if (tagNames) {
            target.tags = tagNames.map((name) => ({
              tagId: count++,
              tagName: name,
            }));
          }
          if (imageKey && updates.previewUrl) {
            target.imageUrl = updates.previewUrl;
          }
        }
      });
  },
});

export const { reset, addBookmark } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
