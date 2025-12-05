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

const bookmarkMarkerSlice = createSlice({
  name: 'bookmarkMarker',
  initialState,
  reducers: {
    initializeMarkers: (
      state,
      action: PayloadAction<{ bookmarkId: number; lat: number; lng: number }[]>
    ) => {
      state.markers = action.payload.map((b, idx) => ({
        id: state.counter + idx,
        position: { lat: b.lat, lng: b.lng },
        bookmarks: [b.bookmarkId],
      }));
      state.counter += action.payload.length;
    },
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
    resetMarkers: (state) => {
      state.markers = [];
      state.counter = 1;
      state.openIds = [];
    },
    incrementCounter: (state) => {
      state.counter += 1;
    },
  },
});

export const {
  initializeMarkers,
  addMarker,
  removeMarker,
  toggleOpen,
  addBookmarkToMarker,
  removeBookmarkFromMarker,
  resetMarkers,
  incrementCounter,
} = bookmarkMarkerSlice.actions;

export default bookmarkMarkerSlice.reducer;
