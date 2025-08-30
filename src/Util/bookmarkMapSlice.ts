// src/Util/bookmarkMapSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type latlng = { lat: number; lng: number };
export type Marker = {
  id: number;
  position: latlng;
  bookmarks: number[];
};

interface BookmarkMapState {
  markers: Marker[];
  counter: number;
  openIds: number[];
}

const initialState: BookmarkMapState = {
  markers: [],
  counter: 1,
  openIds: [],
};

const bookmarkMapSlice = createSlice({
  name: 'bookmarkMap',
  initialState,
  reducers: {
    addMarker: (state, action: PayloadAction<latlng>) => {
      state.markers.push({
        id: state.counter,
        position: action.payload,
        bookmarks: [],
      });
      state.counter += 1;
    },
    removeMarker: (state, action: PayloadAction<number>) => {
      state.markers = state.markers.filter((m) => m.id !== action.payload);
      state.openIds = state.openIds.filter((id) => id !== action.payload);
    },
    toggleOpen: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.openIds.includes(id)) {
        state.openIds = state.openIds.filter((oid) => oid !== id);
      } else {
        state.openIds.push(id);
      }
    },
    addBookmarkToMarker: (
      state,
      action: PayloadAction<{ markerId: number; bookmarkId: number }>
    ) => {
      const { markerId, bookmarkId } = action.payload;
      const marker = state.markers.find((m) => m.id === markerId);
      if (marker && !marker.bookmarks.includes(bookmarkId)) {
        marker.bookmarks.push(bookmarkId);
      }
    },
    removeBookmarkFromMarker: (
      state,
      action: PayloadAction<{ markerId: number; bookmarkId: number }>
    ) => {
      const { markerId, bookmarkId } = action.payload;
      const marker = state.markers.find((m) => m.id === markerId);
      if (marker) {
        marker.bookmarks = marker.bookmarks.filter((id) => id !== bookmarkId);
      }
    },
  },
});

export const {
  addMarker,
  removeMarker,
  toggleOpen,
  addBookmarkToMarker,
  removeBookmarkFromMarker,
} = bookmarkMapSlice.actions;

export default bookmarkMapSlice.reducer;
