import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type modalState = {
  categoryAdd: boolean;
};

const initialState: modalState = {
  categoryAdd: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setcategoryAdd: (state, action: PayloadAction<boolean>) => {
      state.categoryAdd = action.payload;
    },
  },
});

export const { setcategoryAdd } = modalSlice.actions;
export default modalSlice.reducer;
