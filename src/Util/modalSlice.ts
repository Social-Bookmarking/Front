import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface modalState {
  bookmarkAdd: boolean;
  categoryAdd: boolean;
  memberManager: boolean;
}

const initialState: modalState = {
  bookmarkAdd: false,
  categoryAdd: false,
  memberManager: false,
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
  },
});

export const { setcategoryAdd, setMemberManger, setBookMarkAdd } =
  modalSlice.actions;
export default modalSlice.reducer;
