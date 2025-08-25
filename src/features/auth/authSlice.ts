import { message } from 'antd';
// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../../app/store';
import type { AuthState, ChangePasswordState } from '../../types/authState';
import { getPersistedTokens } from '../../utils/token';
import ChangePasswordPage from '../../auth/ChangePassword';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;



const initialChangePasswordState: ChangePasswordState = {
  status: 'idle',
  error: null,
  message: null,
  password: null,
  passwordConfirm: null,
};


const initialState: AuthState = {
  token: null,
  bcToken: null,
  staffNo: null,
  status: 'idle',
  error: null,
  message: null,
  otpCode: null,
  password: null,
  changePassword: initialChangePasswordState, // ✅ FIX
};

export const login = createAsyncThunk<
  { token: string; bcToken: string; staffNo: string,message: string },
  { StaffNo: string; Password: string },
  { rejectValue: { message: string } }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API_ENDPOINT}/Account/login`, credentials);

    if (data.status !== 'ACTIVE') {
      return rejectWithValue({ message: data.message });
    }

    return {
      token: data.token,
      bcToken: data.bcToken,
      staffNo: credentials.StaffNo,
      message: data.message
    };
  }catch (error: any) {
    return rejectWithValue({ message:error?.response?.data?.error|| 'Failed to fetch return dates' });
    
  }
});

export const resetPassword = createAsyncThunk<
  { status: number; message: string },
  { staffNo: string | null; randomKey: string | null; newPassword: string },
  { rejectValue: { message: string } }
>('auth/resetPassword', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API_ENDPOINT}/Account/complete-forgot-password`, credentials);

   return {
        status: data.responseDTO.statusCode,
        message: data.responseDTO.description,
      };
  } catch (err: any) {
    return rejectWithValue({ message: err.message || 'Reset Password failed' });
  }
});

export const forgetPassword = createAsyncThunk<
  { status: number; message: string },
  { StaffNo: string },
  { rejectValue: { message: string } }
>(
  'auth/forgetPassword',
  async ({ StaffNo }, { rejectWithValue }) => {
    try {
      console.log('staffnumber', StaffNo);
      const { data } = await axios.post(
        `${API_ENDPOINT}/Account/forgot-password?staffNo=${StaffNo}`
      );

      return {
        status: data.responseDTO.statusCode,
        message: data.responseDTO.description,
      };
    } catch (err: any) {
      return rejectWithValue({
        message: err.response?.data?.error || 'Change Password failed',
      });
    }
  }
);

export const changePassword = createAsyncThunk<
  { status: number; message: string },
  { password: string; },
  { rejectValue: { message: string } }
>('auth/changePassword', async (values, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.post(`${API_ENDPOINT}/Account/change-password?newPassword=${values.password}`, values, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });
    return {
      status: data.status,
      message: data.description,
    };
  } catch (err: any) {
    return rejectWithValue({ message: err.message || 'Change Password failed' });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = state.bcToken = state.staffNo = null;
      state.status = 'idle';
    },

  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (s) => {
        s.status = 'pending';
        s.error = null;
      })
      .addCase(login.fulfilled, (s, { payload }) => {
        s.status = 'idle';
        s.token = payload.token;
        s.bcToken = payload.bcToken;
        s.staffNo = payload.staffNo;
        s.message = payload.message
      })
      .addCase(login.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload?.message ?? 'Unknown error';
        s.token = s.bcToken = s.staffNo = null;
      })
      .addCase(forgetPassword.pending, (s) => {
        s.status = 'pending';
        s.error = null;
      })
      .addCase(forgetPassword.fulfilled, (s, { payload }) => {
        s.status = 'idle';
        s.message = payload.message;
      })
      .addCase(forgetPassword.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload?.message ?? 'Unknown error';
      }).
      addCase(resetPassword.pending, (s) => {
        s.status = 'pending';
        s.error = null;
      })
      .addCase(resetPassword.fulfilled, (s, { payload }) => {
        s.status = 'idle';
        s.message = payload.message;
      })
      .addCase(resetPassword.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload?.message ?? 'Unknown error';
      })
      .addCase(changePassword.pending, (s) => {
        s.changePassword.status = 'pending';
        s.changePassword.error = null;
      })
      .addCase(changePassword.fulfilled, (s, { payload }) => {
        s.changePassword.status = 'idle';
        s.changePassword.message = payload.message;
      })
      .addCase(changePassword.rejected, (s, { payload }) => {
        s.changePassword.status = 'failed';
        s.changePassword.error = payload?.message ?? 'Unknown error';
      });


  },
});

export const { logout } = authSlice.actions;
export const selectAuth = (state: RootState) => ({
  token: state.auth.token,
  bcToken: state.auth.bcToken,
  staffNo: state.auth.staffNo,
  status: state.auth.status,
  error: state.auth.error,
  message: state.auth.message,

});

export const selectForgetPassword = (state: RootState) => ({
  status: state.auth.status,
  error: state.auth.error,
  message: state.auth.message,
});

export const selectResetPassword = (state: RootState) => ({
  status: state.auth.status,
  error: state.auth.error,
  message: state.auth.message,
});

export const selectChangePassword = (state: RootState) => ({
  status: state.auth.changePassword.status,
  error: state.auth.changePassword.error,
  message: state.auth.changePassword.message,
});

export default authSlice.reducer;
