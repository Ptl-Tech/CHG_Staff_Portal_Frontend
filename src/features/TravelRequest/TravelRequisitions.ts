import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import { message } from 'antd';
import type { RootState } from '../../app/store';
import type { TravelRequest } from '../../types/logisticsTypes';
import type { StatusRequestResponse } from '../../types/dropdown';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface TravelRequestState {
  list: TravelRequest[];
  status: 'idle' | 'pending' | 'failed';
  error: string | null;
  travelRequestPayload: TravelRequest;
  statusResponse:StatusRequestResponse|null;
  travelRequestDoc: TravelRequest | null;
}

const initialState: TravelRequestState = {
  list: [],
  travelRequestPayload: {} as TravelRequest,
  statusResponse:{} as StatusRequestResponse | null,
  travelRequestDoc: null,
  status: 'idle',
  error: null,
};

// Fetch all travel requests
export const fetchTravelRequestList = createAsyncThunk<
  TravelRequest[],
  void,
  { rejectValue: { message: string } }
>(
  'travel/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Logistics/travel/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch Travel requisitions',
      });
    }
  }
);
// Submit new travel request
export const submitTravelRequest = createAsyncThunk<
  StatusRequestResponse,
  TravelRequest,
  { rejectValue: { message: string } }
>(
  'travel/submitTravelRequest',
  async (payloadData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(`${API_ENDPOINT}/Logistics/submit-travelRequest`, payloadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data; // 👈 returns the full object: {statusCode, description, status}
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Travel Request submission failed');
      return rejectWithValue({ message: err.message || 'Travel Request submission failed' });
    }
  }
);

//fetch a single request
export const fetchTravelRequest = createAsyncThunk<
  TravelRequest,
  string,
  { rejectValue: { message: string } }
>(
  'travel/fetchTravelRequest',
  async (documentNo, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Logistics/single-travel-request?documentNo=${documentNo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || 'Failed to fetch travel request' });
    }
  }
);


// Slice
const travelRequestSlice = createSlice({
  name: 'travelRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTravelRequestList.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchTravelRequestList.fulfilled, (state, action) => {
        state.status = 'idle';
        state.list = action.payload;
      })
      .addCase(fetchTravelRequestList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? null;
      })
      .addCase(submitTravelRequest.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(submitTravelRequest.fulfilled, (state, action) => {
        state.status = 'idle';
        state.statusResponse=action.payload;
      })
      .addCase(submitTravelRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? null;
      })
      .addCase(fetchTravelRequest.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchTravelRequest.fulfilled, (state, action) => {
        state.status = 'idle';
state.travelRequestDoc = action.payload;
      })
      .addCase(fetchTravelRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? null;
      })
  },
});

export const selectedTravelRequestList = (state: RootState) => state.travelRequests;
export const selectedSubmitTravelRequest = (state: RootState) => ({
  status: state.travelRequests.status,
  error: state.travelRequests.error,
});

export const selectedTravelRequest = (state: RootState) => ({
  status: state.travelRequests.status,
  error: state.travelRequests.error,
  travelRequestDoc: state.travelRequests.travelRequestDoc
})


export default travelRequestSlice.reducer;
