import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface InviteCode {
  inviteCode: string;
}

const initialState: InviteCode = {
  inviteCode: '',
};

const inviteCodeSlice = createSlice({
  name: 'inviteCode',
  initialState,
  reducers: {
    setInviteCode(state, action: PayloadAction<string>) {
      state.inviteCode = action.payload;
    },
  },
});

export const { setInviteCode } = inviteCodeSlice.actions;
export default inviteCodeSlice.reducer;
