import { configureStore } from '@reduxjs/toolkit';
import permissionReducer from './slice/permissionSlice';

const store = configureStore({
  reducer: {
    userPermission: permissionReducer,
  },
});

export default store;
