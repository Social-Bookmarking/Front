import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './categorySlice';
import modalReducer from './modalSlice';
import membersReducer from './memberSlice';
import bookmarkReducer from './bookmarkSlice';
import groupReducer from './groupSlice';

export const store = configureStore({
  reducer: {
    bookmark: bookmarkReducer,
    categories: categoriesReducer,
    modal: modalReducer,
    member: membersReducer,
    group: groupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
