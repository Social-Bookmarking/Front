import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// 맵에 북마크 추가를 위한 것
type latlng = { lat: number; lng: number };
type Marker = {
  id: number;
  position: latlng;
  bookmarks: number[];
};

interface modalState {
  bookmarkAdd: boolean;
  categoryAdd: boolean;
  memberManager: boolean;
  // 맵에 북마크 추가 모달
  bookmarkMapAdd: boolean;
  bookmarkMapContext: Marker | null;
}

const initialState: modalState = {
  bookmarkAdd: false,
  categoryAdd: false,
  memberManager: false,
  bookmarkMapAdd: false,
  bookmarkMapContext: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setBookMarkAdd: (state, action: PayloadAction<boolean>) => {
      state.bookmarkAdd = action.payload;
    },
    setcategoryAdd: (state, action: PayloadAction<boolean>) => {
      state.categoryAdd = action.payload;
    },
    setMemberManger: (state, action: PayloadAction<boolean>) => {
      state.memberManager = action.payload;
    },
    setBookMarkMapAdd: (
      state,
      action: PayloadAction<{ open: boolean; marker?: Marker }>
    ) => {
      state.bookmarkMapAdd = action.payload.open;
      state.bookmarkMapContext = action.payload.open
        ? action.payload.marker ?? null
        : null;
    },
  },
});

export const {
  setcategoryAdd,
  setMemberManger,
  setBookMarkAdd,
  setBookMarkMapAdd,
} = modalSlice.actions;
export default modalSlice.reducer;
