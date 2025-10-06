// features/leave/leaveListSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../../app/store';
import type { LeaveApplication } from '../../types/leave';
import { getPersistedTokens } from '../../utils/token';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface LeaveDocumentState {
  leave: LeaveApplication | null;
  status: 'idle' | 'pending' | 'failed';
  error: string | null;
}

const initialState: LeaveDocumentState = {
  leave: null,
  status: 'idle',
  error: null,
};

export const fetchLeaveDocument = createAsyncThunk<
  LeaveApplication,                
  { leaveNo: string },           
  { rejectValue: { message: string } }
>('leave/fetchLeaveDocument', async ({ leaveNo }, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.get(`${API_ENDPOINT}/Leave/one-leave?leaveNo=${leaveNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });

    return data;
  } catch (err: any) {
    return rejectWithValue({ message: err.message || 'Failed to fetch leave document' });
  }
});

const leaveDocumentSlice = createSlice({
  name: 'leaveDocument',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveDocument.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchLeaveDocument.fulfilled, (state, { payload }) => {
        state.status = 'idle';
        state.leave = payload;
      })
      .addCase(fetchLeaveDocument.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload?.message ?? 'Unknown error';
      });
  },
});

export const selectLeaveDocument = (state: RootState) => state.leaveDocument;

export default leaveDocumentSlice.reducer;
