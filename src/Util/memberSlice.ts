import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

// 나중에 수정
interface Member {
  userid: string;
  name: string;
  email: string;
  profileImageUrl: string;
  permission: Role;
}

interface MemberState {
  memberList: Member[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: MemberState = {
  memberList: [],
  status: 'idle',
};

export const fetchMembers = createAsyncThunk<Member[], number>(
  'member/fetchMembers',
  async (groupId) => {
    const res = await axios.get<Member[]>(
      `https://www.marksphere.link/api/groups/${groupId}/members`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    console.log(res.data);
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
        (m) => m.userid !== action.payload
      );
    },
    changeRole: (state, action: PayloadAction<{ id: string; role: Role }>) => {
      const { id, role } = action.payload;
      const target = state.memberList.find((m) => m.userid === id);
      if (target) {
        target.permission = role;
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
