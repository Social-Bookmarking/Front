import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from './store';
import { fetchCategories } from './categorySlice';
import { fetchMembers } from './memberSlice';

// id 없을 수도..
export interface Group {
  id: number;
  name: string;
  description: string;
}

interface GroupState {
  groups: Group[];
  selectedGroupId: number | null;
}

const initialState: GroupState = {
  groups: [
    { id: 1, name: '디자인팀', description: '디자인 관련 북마크 스페이스' },
    { id: 2, name: '개발팀', description: '개발자 전용 스페이스' },
    { id: 3, name: '마케팅팀', description: '마케팅 자료 모음' },
  ],
  selectedGroupId: 1,
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    selectGroup(state, action: PayloadAction<number>) {
      state.selectedGroupId = action.payload;
    },
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
    await dispatch(fetchCategories());
    await dispatch(fetchMembers());
  };
