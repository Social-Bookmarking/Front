import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axios from 'axios';

type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

// 나중에 수정
interface Member {
  userId: number;
  name: string;
  email: string;
  profileImageUrl: string;
  permission: Role;
}

interface MemberState {
  memberList: Member[];
}

const initialState: MemberState = {
  memberList: [],
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
    return res.data;
  }
);

export const changeRole = createAsyncThunk<
  { memberId: number; role: Role },
  { groupId: number; memberId: number; role: Role }
>(
  'member/changeRole',
  async ({ groupId, memberId, role }, { rejectWithValue }) => {
    try {
      await axios.patch(
        `https://www.marksphere.link/api/groups/${groupId}/members/${memberId}`,
        { permission: role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return { memberId, role };
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        toast.error('권한이 없습니다.');
        return rejectWithValue('forbidden');
      }
      toast.error('역할 변경 중 오류가 발생했습니다.');
      return rejectWithValue('error');
    }
  }
);

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    addMember: (state, action: PayloadAction<Member>) => {
      state.memberList.push(action.payload);
    },
    removeMember: (state, action: PayloadAction<number>) => {
      state.memberList = state.memberList.filter(
        (m) => m.userId !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.memberList = action.payload;
      })
      .addCase(changeRole.fulfilled, (state, action) => {
        const { memberId, role } = action.payload;
        const target = state.memberList.find((m) => m.userId === memberId);
        if (target) {
          target.permission = role;
        }
      });
  },
});

export const { addMember, removeMember } = memberSlice.actions;
export default memberSlice.reducer;
