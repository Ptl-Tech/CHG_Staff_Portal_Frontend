// features/leave/leaveListSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../../app/store';
import type { LeaveApplication } from '../../types/leave';
import { getPersistedTokens } from '../../utils/token';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface LeaveListState {
  leaves: LeaveApplication[];
  status: 'idle' | 'pending' | 'failed';
  error: string | null;
}

const initialState: LeaveListState = {
  leaves: [],
  status: 'idle',
  error: null,
};

export const fetchLeaves = createAsyncThunk<
  LeaveApplication[], 
  void,               
  { rejectValue: { message: string } }
>('leave/fetchLeaves', async (_, { rejectWithValue }) => {
  try {
const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.get(`${API_ENDPOINT}/Leave/all-leaves`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });

    return data;
  } catch (err: any) {
    return rejectWithValue({ message: err.message || 'Failed to fetch leaves' });
  }
});

const leaveListSlice = createSlice({
  name: 'leaveList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, { payload }) => {
        state.status = 'idle';
        state.leaves = payload;
      })
      .addCase(fetchLeaves.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload?.message ?? 'Unknown error';
      });
  },
});

export const selectLeaveList = (state: RootState) => state.leaveList;
export default leaveListSlice.reducer;
