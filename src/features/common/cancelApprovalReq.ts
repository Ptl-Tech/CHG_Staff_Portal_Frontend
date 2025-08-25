// features/leave/sendForApproval.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface CancelApprovalParams {
  docNo: string;
  endpoint: string;
}

interface CancelApprovalResponse {
  message: string;
}

interface CancelApprovalState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  message: string | null;
  error: string | null;
}

const initialState: CancelApprovalState = {
  status: 'idle',
  message: null,
  error: null,
};

export const cancelApproval = createAsyncThunk<
  CancelApprovalResponse,
  CancelApprovalParams,
  { rejectValue: { message: string } }
>(
  'approval/cancelApproval',
  async ({ docNo, endpoint }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();

      const { data } = await axios.post(
        `${API_ENDPOINT}${endpoint}`,
        { docNo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'BC-Authorization': bcToken || '',
          },
        }
      );

      return {
        message: data?.description ?? 'Cancelled approval successfully',
      };
    } catch (err: any) {
      return rejectWithValue({
        message: err.response?.data?.error || err.message || 'Unexpected error',
      });
    }
  }
);

const cancelApprovalSlice = createSlice({
  name: 'cancelApproval',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cancelApproval.pending, (state) => {
        state.status = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(cancelApproval.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(cancelApproval.rejected, (state, action) => {
        state.status = 'failed';
        state.message = null;
        state.error = action.payload?.message || 'Something went wrong';
      });
  },
});

export const selectCancelApprovalApplication = (state: RootState) =>
  state.cancelApproval;

export default cancelApprovalSlice.reducer;
