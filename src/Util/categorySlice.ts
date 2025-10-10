import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export type Category = { id: number; name: string; bookmarkCount: number };

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

// 목록 가져오기
export const fetchCategories = createAsyncThunk<Category[], number | null>(
  'categories/fetch',
  async (groupId) => {
    const res = await axios.get<Category[]>(
      `https://www.marksphere.link/api/groups/${groupId}/categories`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return res.data;
  }
);

// 추가, 수정, 삭제 할 때 마다 목록을 가져오도록 하기

// 추가하기
export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload: { groupId: number; name: string }) => {
    const res = await axios.post<Category[]>(
      `https://www.marksphere.link/api/groups/${payload.groupId}/categories`,
      { name: payload.name },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return res.data;
  }
);

// 수정하기
export const renameCategory = createAsyncThunk(
  'categories/rename',
  async (payload: { id: number; name: string }) => {
    const res = await axios.patch<Category[]>(
      `https://www.marksphere.link/api/categories/${payload.id}`,
      { name: payload.name },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return res.data;
  }
);
// 삭제하기
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (payload: { id: number }) => {
    await axios.delete(
      `https://www.marksphere.link/api/categories/${payload.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return payload.id;
  }
);

// 순서 바꾸기
export const updateCategoryOrder = createAsyncThunk(
  'categories/updateOrder',
  async (payload: {
    groupId: number;
    ordered: { categoryId: number; position: number }[];
  }) => {
    const res = await axios.patch<Category[]>(
      `https://www.marksphere.link/api/groups/${payload.groupId}/categories/order`,
      payload.ordered,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return res.data;
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
        if (state.selectedId === null && action.payload.length > 0) {
          state.selectedId = -1;
        }
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(renameCategory.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
        // 삭제 된 카테고리가 선택된 카테고리이면
        if (state.selectedId === action.payload) state.selectedId = -1;
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
