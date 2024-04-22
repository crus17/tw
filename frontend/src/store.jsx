import { configureStore } from '@reduxjs/toolkit';
import accountVerificationReducer from './app/accountVerification/slice'


export const store = configureStore({
  reducer: {
    accountVerification: accountVerificationReducer,
  },
});