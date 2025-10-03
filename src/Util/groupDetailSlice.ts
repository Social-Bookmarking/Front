import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface GroupDetail {
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
  status: string;
  deletionScheduledAt?: string;
}

interface GroupDetailState {
  detail: GroupDetail | null;
}

const initialState: GroupDetailState = {
  detail: null,
};

export const fetchGroupDetail = createAsyncThunk<GroupDetail, number>(
  'groupDetail/fetch',
  async (groupId) => {
    const { data } = await axios.get<GroupDetail>(
      `https://www.marksphere.link/api/groups/${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return data;
  }
);

const groupDetailSlice = createSlice({
  name: 'groupDetail',
  initialState,
  reducers: {
    clearGroupDetail(state) {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGroupDetail.fulfilled, (state, action) => {
      state.detail = action.payload;
    });
  },
});

export const { clearGroupDetail } = groupDetailSlice.actions;
export default groupDetailSlice.reducer;
