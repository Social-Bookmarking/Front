import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface modalState {
  categoryAdd: boolean;
  memberManager: boolean;
}

const initialState: modalState = {
  categoryAdd: false,
  memberManager: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setcategoryAdd: (state, action: PayloadAction<boolean>) => {
      state.categoryAdd = action.payload;
    },
    setMemberManger: (state, action: PayloadAction<boolean>) => {
      state.memberManager = action.payload;
    },
  },
});

export const { setcategoryAdd, setMemberManger } = modalSlice.actions;
export default modalSlice.reducer;
