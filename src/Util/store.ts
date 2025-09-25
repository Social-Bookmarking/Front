import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './categorySlice';
import modalReducer from './modalSlice';
import membersReducer from './memberSlice';
import bookmarkReducer from './bookmarkSlice';
import groupReducer from './groupSlice';
import bookmarkMarkerReducer from './bookmarkMarkerSlice';
import bookmarkMapReducer from './bookmarkMapSlice';
import userReducer from './user';
import userBookmarkReducer from './userBookmarkSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    bookmark: bookmarkReducer,
    bookmarkMarker: bookmarkMarkerReducer,
    bookmarkMap: bookmarkMapReducer,
    categories: categoriesReducer,
    modal: modalReducer,
    member: membersReducer,
    group: groupReducer,
    userBookmark: userBookmarkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
