import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const accountVerificationSlice = createSlice({
  name: 'accountVerification',
  initialState,
  reducers: {
    validateSeedPhraseStart: state => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    validateSeedPhraseSuccess: (state, action) => {
      state.isAuthenticated = action.payload;
      state.loading = false;
    },
    validateSeedPhraseFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    submitVerificationFormStart: state => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    submitVerificationFormSuccess: (state, action) => {
      state.formSubmitted = action.payload;
      state.loading = false;
    },
    submitVerificationFormFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    loginWalletStart: state => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    loginWalletSuccess: (state, action) => {
      state.isAuthenticated = action.payload;
      state.loading = false;
    },
    loginWalletFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    getUsersStart: state => {
      state.loading = true;
    },
    getUsersSuccess: (state, action) => {
      state.users = action.payload;
      state.loading = false;
    },
    getUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    
    clearAccountValidationErrors: (state, action) => {
      state.loading = false;
      state.error = null;
      state.formSubmitted = false;
      state.isAuthenticated = false;
    },

    createAccountValidationError: (state, action)=>{
      state.loading = false;
      state.error = action.payload
    }

  },
});

export const { 
  validateSeedPhraseStart, 
  validateSeedPhraseSuccess, 
  validateSeedPhraseFailure,
  submitVerificationFormStart, 
  submitVerificationFormSuccess, 
  submitVerificationFormFailure,
  loginWalletStart, 
  loginWalletSuccess, 
  loginWalletFailure,
  getUsersStart, 
  getUsersSuccess, 
  getUsersFailure,

  clearAccountValidationErrors,
  createAccountValidationError,
} = accountVerificationSlice.actions;

export default accountVerificationSlice.reducer;
