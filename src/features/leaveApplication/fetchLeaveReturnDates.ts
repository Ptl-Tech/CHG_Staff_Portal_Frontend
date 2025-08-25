// features/leave/returnDatesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../../app/store';
import { getPersistedTokens } from '../../utils/token';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface ReturnDatesPayload {
  leaveNo: string;
  leaveType: string;
  startDate: string;
  leaveDays: number;
}

interface ReturnDatesResponse {
  returnDate: string;
  endDate: string;
  leaveDays:number;
  leaveNo: string;
}

interface ReturnDatesState {
  data: ReturnDatesResponse | null;
  status: 'idle' | 'pending' | 'failed';
  error: string | null;
}

const initialState: ReturnDatesState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchReturnDates = createAsyncThunk<
  ReturnDatesResponse,
  ReturnDatesPayload,
  { rejectValue: { message: string } }
>('leave/fetchReturnDates', async (payload, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.post(`${API_ENDPOINT}/Leave/apply-leave`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });

    return {
      returnDate: data.returnDate,
      endDate: data.endDate,
      leaveDays: data.leaveDays,
      leaveNo: data.docNo,
    };
  } catch (error: any) {
    return rejectWithValue({ message:error.response?.data?.error|| 'Failed to fetch return dates' });
    
  }

});

const returnDatesSlice = createSlice({
  name: 'returnDates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReturnDates.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchReturnDates.fulfilled, (state, { payload }) => {
        state.status = 'idle';
        state.data = payload;
      })
      .addCase(fetchReturnDates.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload?.message ?? 'Unknown error';
        
      });
  },
});

export const selectReturnDates = (state: RootState) => state.returnDates;
export default returnDatesSlice.reducer;
