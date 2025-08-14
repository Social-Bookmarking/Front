import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// 나중에 수정
interface Member {
  id: string;
  name: string;
  email: string;
  profile: string;
  role: string;
}

interface MemberState {
  memberList: Member[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: MemberState = {
  memberList: [],
  status: 'idle',
};

export const fetchMembers = createAsyncThunk<Member[]>(
  'member/fetchMembers',
  async () => {
    const res = await axios.get<Member[]>('/api/members');
    return res.data;
  }
);

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    addMember: (state, action: PayloadAction<Member>) => {
      state.memberList.push(action.payload);
    },
    removeMember: (state, action: PayloadAction<string>) => {
      state.memberList = state.memberList.filter(
        (m) => m.id !== action.payload
      );
    },
    changeRole: (
      state,
      action: PayloadAction<{ id: string; role: string }>
    ) => {
      const { id, role } = action.payload;
      const target = state.memberList.find((m) => m.id === id);
      if (target) {
        target.role = role;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.memberList = action.payload;
      })
      .addCase(fetchMembers.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { addMember, removeMember, changeRole } = memberSlice.actions;
export default memberSlice.reducer;
