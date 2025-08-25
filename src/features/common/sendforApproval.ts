// features/leave/sendForApproval.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';
import { createSlice } from '@reduxjs/toolkit'; // Needed to define approvalSlice

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface SendForApprovalParams {
  docNo: string;
  endpoint: string;
}

interface ApprovalResponse {
  message: string;
}

interface ApprovalState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  message: string | null;
  error: string | null;
}

const initialState: ApprovalState = {
  status: 'idle',
  message: null,
  error: null,
};

export const sendForApproval = createAsyncThunk<
  ApprovalResponse,
  SendForApprovalParams,
  { rejectValue: { message: string } }
>(
  'approval/sendForApproval',
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
        message: data?.message ?? 'Sent for approval successfully',
      };
    } catch (err: any) {
      console.log(err);
      return rejectWithValue({
        message: err.response?.data?.error || err.message,
      });
    }
  }
);

const approvalSlice = createSlice({
  name: 'approval',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendForApproval.pending, (state) => {
        state.status = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(sendForApproval.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(sendForApproval.rejected, (state, action) => {
        state.status = 'failed';
        state.message = null;
        state.error = action.payload?.message || 'Something went wrong';
      });
  },
});

export const selectApprovalApplication = (state: RootState) => state.approval;

export default approvalSlice.reducer;
