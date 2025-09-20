import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from './store';
import { fetchCategories } from './categorySlice';
import { fetchMembers } from './memberSlice';
import axios from 'axios';

export interface Group {
  teamId: number;
  groupName: string;
  description: string;
}

interface GroupState {
  groups: Group[];
  selectedGroupId: number | null;
}

const initialState: GroupState = {
  groups: [],
  selectedGroupId: null,
};

export const fetchGroups = createAsyncThunk<Group[]>(
  'groups/fetch',
  async () => {
    const { data } = await axios.get<Group[]>(
      `https://www.marksphere.link/api/me/groups`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return data;
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    selectGroup(state, action: PayloadAction<number>) {
      state.selectedGroupId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.groups = action.payload;
      if (action.payload.length > 0) {
        state.selectedGroupId = action.payload[0].teamId;
      }
    });
  },
});

export const { selectGroup } = groupSlice.actions;
export default groupSlice.reducer;

export const selectGroups = (state: { group: GroupState }) =>
  state.group.groups;
export const selectSelectedGroup = (state: { group: GroupState }) =>
  state.group.selectedGroupId;

export const changeGroup =
  (groupId: number) => async (dispatch: AppDispatch) => {
    dispatch(selectGroup(groupId));
    // 나중에 API 주소에 groupId를 넣어야 함.
    await dispatch(fetchCategories(groupId));
    await dispatch(fetchMembers(groupId));
  };
