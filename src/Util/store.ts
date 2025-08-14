import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './categorySlice';
import modalReducer from './modalSlice';
import membersReducer from './memberSlice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    modal: modalReducer,
    member: membersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
