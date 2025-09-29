import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// 맵에 북마크 추가를 위한 것
type latlng = { lat: number; lng: number };
type Marker = {
  id: number;
  position: latlng;
  bookmarks: number[];
};

interface modalState {
  bookmarkAdd: boolean;
  categoryAdd: boolean;
  memberManager: boolean;
  // 맵에 북마크 추가 모달
  bookmarkMapAdd: boolean;
  bookmarkMapContext: Marker | null;
  groupAdd: boolean;
  groupModify: boolean;
  commentModal: boolean;
  commentModalbookmarkId: number | null;
  myPage: boolean;
  QRCodeModal: boolean;
  groupParticipationModal: boolean;
  groupDeleteModal: boolean;
  groupExitModal: boolean;
}

const initialState: modalState = {
  bookmarkAdd: false,
  categoryAdd: false,
  memberManager: false,
  bookmarkMapAdd: false,
  bookmarkMapContext: null,
  groupAdd: false,
  groupModify: false,
  commentModal: false,
  commentModalbookmarkId: null,
  myPage: false,
  QRCodeModal: false,
  groupParticipationModal: false,
  groupDeleteModal: false,
  groupExitModal: false,
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
    setBookMarkMapAdd: (
      state,
      action: PayloadAction<{ open: boolean; marker?: Marker }>
    ) => {
      state.bookmarkMapAdd = action.payload.open;
      state.bookmarkMapContext = action.payload.open
        ? action.payload.marker ?? null
        : null;
    },
    setGroupAdd: (state, action: PayloadAction<boolean>) => {
      state.groupAdd = action.payload;
    },
    setGroupModify: (state, action: PayloadAction<boolean>) => {
      state.groupModify = action.payload;
    },
    setCommentModal: (
      state,
      action: PayloadAction<{ open: boolean; bookmarkId?: number }>
    ) => {
      state.commentModal = action.payload.open;
      state.commentModalbookmarkId = action.payload.open
        ? action.payload.bookmarkId ?? null
        : null;
    },
    setMyPage: (state, action: PayloadAction<boolean>) => {
      state.myPage = action.payload;
    },
    setQRcodeModal: (state, action: PayloadAction<boolean>) => {
      state.QRCodeModal = action.payload;
    },
    setGroupParticipationModal: (state, action: PayloadAction<boolean>) => {
      state.groupParticipationModal = action.payload;
    },
    setGroupDeleteModal: (state, action: PayloadAction<boolean>) => {
      state.groupDeleteModal = action.payload;
    },
    setGroupExitModal: (state, action: PayloadAction<boolean>) => {
      state.groupExitModal = action.payload;
    },
  },
});

export const {
  setcategoryAdd,
  setMemberManger,
  setBookMarkAdd,
  setBookMarkMapAdd,
  setGroupAdd,
  setGroupModify,
  setCommentModal,
  setMyPage,
  setQRcodeModal,
  setGroupParticipationModal,
  setGroupDeleteModal,
  setGroupExitModal,
} = modalSlice.actions;
export default modalSlice.reducer;
