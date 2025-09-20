import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './categorySlice';
import modalReducer from './modalSlice';
import membersReducer from './memberSlice';
import bookmarkReducer from './bookmarkSlice';
import groupReducer from './groupSlice';
import bookmarkMarkerReducer from './bookmarkMarkerSlice';
import bookmarkMapReducer from './bookmarkMapSlice';

export const store = configureStore({
  reducer: {
    bookmark: bookmarkReducer,
    bookmarkMarker: bookmarkMarkerReducer,
    bookmarkMap: bookmarkMapReducer,
    categories: categoriesReducer,
    modal: modalReducer,
    member: membersReducer,
    group: groupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
