import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export type Category = { id: number; name: string; count: number };

export type CategoriesState = {
  list: Category[];
  selectedId: number | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
};

const initialState: CategoriesState = {
  list: [],
  selectedId: null,
  status: 'idle',
};

// 나중에 수정해야 함.

// 목록 가져오기
export const fetchCategories = createAsyncThunk(
  'categories/fetch',
  async () => {
    const res = await axios.get<Category[]>('/api/categories');
    return res.data;
  }
);

// 추가, 수정, 삭제 할 때 마다 목록을 가져오도록 하기

// 추가하기
export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload: { name: string }) => {
    const res = await axios.post<Category>('/api/categories', payload);
    return res.data;
  }
);

// 수정하기
export const renameCategory = createAsyncThunk(
  'categories/rename',
  async (payload: { id: number; name: string }) => {
    const res = await axios.put<Category>(
      `/api/categories/${payload.id}`,
      payload
    );
    return res.data;
  }
);
// 삭제하기
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (payload: { id: number }) => {
    await axios.delete(`/api/categories/${payload.id}`);
    return payload.id;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    selectCategory(state, action: PayloadAction<number>) {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        if (!state.selectedId && action.payload.length > 0) {
          state.selectedId = state.list[0].id;
        }
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(renameCategory.fulfilled, (state, action) => {
        const i = state.list.findIndex((c) => c.id === action.payload.id);
        if (i >= 0) state.list[i] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
        // 삭제 된 카테고리가 선택된 카테고리이면
        if (state.selectedId === action.payload)
          state.selectedId = state.list[0]?.id ?? null;
      });
  },
});

export const { selectCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;

export const selectCategories = (state: { categories: CategoriesState }) =>
  state.categories.list;
export const selectSelectedId = (state: { categories: CategoriesState }) =>
  state.categories.selectedId;
export const selectCatStatus = (s: { categories: CategoriesState }) =>
  s.categories.status;
