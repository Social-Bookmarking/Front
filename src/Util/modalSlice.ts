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
  bookmarkModifyModal: boolean;
  bookmarkModifybookmarkId: number | null;
  // 회원탈퇴할 때 소유자 이전
  ownershipTransferModal: boolean;
  ownershipTransferContext: {
    groups: { groupId: number; groupName: string }[];
    currentIndex: number;
  };
  groupOwnershipTransperModal: boolean;
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
  bookmarkModifyModal: false,
  bookmarkModifybookmarkId: null,
  ownershipTransferModal: false,
  ownershipTransferContext: { groups: [], currentIndex: 0 },
  groupOwnershipTransperModal: false,
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
    setBookMarkModifyModal: (
      state,
      action: PayloadAction<{ open: boolean; bookmardId?: number }>
    ) => {
      state.bookmarkModifyModal = action.payload.open;
      state.bookmarkModifybookmarkId = action.payload.open
        ? action.payload.bookmardId ?? null
        : null;
    },
    setOwnershipTransferModal: (
      state,
      action: PayloadAction<{
        open: boolean;
        groups?: { groupId: number; groupName: string }[];
      }>
    ) => {
      state.ownershipTransferModal = action.payload.open;
      if (action.payload.open && action.payload.groups) {
        state.ownershipTransferContext = {
          groups: action.payload.groups,
          currentIndex: 0,
        };
      } else {
        state.ownershipTransferContext = { groups: [], currentIndex: 0 };
      }
    },
    nextOwnershipTransferGroup: (state) => {
      state.ownershipTransferContext.currentIndex += 1;
    },
    setGroupOwnershipTransferModal: (state, action: PayloadAction<boolean>) => {
      state.groupOwnershipTransperModal = action.payload;
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
  setBookMarkModifyModal,
  setOwnershipTransferModal,
  nextOwnershipTransferGroup,
  setGroupOwnershipTransferModal,
} = modalSlice.actions;
export default modalSlice.reducer;
