import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
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

export const fetchBookmarksMap = createAsyncThunk<
  CursorResponse<Bookmark>,
  {
    groupId: number | null;
    categoryId: number | null;
    cursor?: number | null;
    keyword?: string;
    tagId?: number | null;
    size?: number;
  }
>(
  'bookmarkMaps/fetch',
  async ({ groupId, categoryId, cursor, keyword, tagId, size }) => {
    if (categoryId === -1) {
      categoryId = null;
    }

    const { data } = await axios.get<CursorResponse<Bookmark>>(
      `https://www.marksphere.link/api/groups/${groupId}/bookmarks/map`,
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

const bookmarMapSlice = createSlice({
  name: 'bookmarkMaps',
  initialState,
  reducers: {
    bookmarkMapreset(state) {
      state.items = [];
      state.loading = false;
      state.cursor = null;
      state.hasNext = true;
    },
    addMapBookmark(state, action: PayloadAction<Bookmark>) {
      const exists = state.items.some(
        (b) => b.bookmarkId === action.payload.bookmarkId
      );
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
    removeMapBookmark(state, action: PayloadAction<number>) {
      state.items = state.items.filter((b) => b.bookmarkId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarksMap.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookmarksMap.fulfilled, (state, action) => {
        const { content, nextCursor, hasNext } = action.payload;

        //중복된 북마크 제외
        const existingIds = new Set(state.items.map((b) => b.bookmarkId));
        const newItems = content.filter((b) => !existingIds.has(b.bookmarkId));

        state.items = [...state.items, ...newItems];
        state.cursor = nextCursor ?? null;
        state.hasNext = hasNext;
        state.loading = false;
      })
      .addCase(fetchBookmarksMap.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { bookmarkMapreset, addMapBookmark, removeMapBookmark } =
  bookmarMapSlice.actions;
export default bookmarMapSlice.reducer;
