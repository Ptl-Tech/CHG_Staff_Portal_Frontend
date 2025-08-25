import type { Destination, PaymentData, PaymentLinesData } from './../../types/PaymentData';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';
import type { StatusRequestResponse } from '../../types/dropdown';
import { message } from 'antd';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

// --- State Type ---
interface OperationState {
  status: 'idle' | 'pending' | 'failed';
  response: StatusRequestResponse | null;
  error: string | null;
}

interface AdvanceRequestState {
  imprestList: PaymentData[];
  imprestPayload: PaymentData | null;
  destinationList: Destination[];
  imprestLinePayload: PaymentData | null;

  fetchStatus: 'idle' | 'pending' | 'failed';
  travelSubmit: OperationState;
  lineSubmit: OperationState;
}

const initialOperationState: OperationState = {
  status: 'idle',
  response: null,
  error: null,
};

const initialState: AdvanceRequestState = {
  imprestList: [],
  imprestPayload: null,
  destinationList: [],
  imprestLinePayload: null,
  fetchStatus: 'idle',
  travelSubmit: { ...initialOperationState },
  lineSubmit: { ...initialOperationState },
};

// --- Thunks ---
export const fetchAdvanceRequestList = createAsyncThunk<
  PaymentData[],
  void,
  { rejectValue: { message: string } }
>(
  'advance/fetchAdvanceList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Finance/all-imprests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data as PaymentData[];
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch advance requisitions',
      });
    }
  }
);

export const fetchDestinationList = createAsyncThunk<
  Destination[],
  void,
  { rejectValue: { message: string } }
>(
  'advance/fetchDestinationList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(
        `${API_ENDPOINT}/Finance/destination-dropdowns`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'BC-Authorization': bcToken || '',
          },
        }
      );
      return data as Destination[];
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch destination list',
      });
    }
  }
);

// Submit new travel request
export const submitTravelAdvanceRequest = createAsyncThunk<
  StatusRequestResponse,
  PaymentData,
  { rejectValue: { message: string } }
>(
  'advance/submitTravelAdvanceRequest',
  async (payloadData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/Finance/imprest-create`,
        payloadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'BC-Authorization': bcToken || '',
          },
        }
      );
      return data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Travel Advance Request submission failed';
      message.error(msg);
      return rejectWithValue({ message: msg });
    }
  }
);

export const submitImprestLine = createAsyncThunk<
  StatusRequestResponse,          // Return type
  PaymentLinesData,               // Payload type
  { rejectValue: { message: string } } // reject type
>(
  'advance/submitImprestLine',
  async (payloadData, { rejectWithValue })=> {
    try {
      const { token, bcToken } = getPersistedTokens();

      const { data } = await axios.post(
        `${API_ENDPOINT}/Finance/add-imprest-lines`,
        payloadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'BC-Authorization': bcToken || '',
          },
        }
      );

      // Ensure data matches StatusRequestResponse type
      return {
        status: data.status,
        description: data.description,
      } as StatusRequestResponse;

    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Imprest Line submission failed';
      message.error(msg);
      return rejectWithValue({ message: msg });
    }
  }
);



// --- Slice ---
const advanceRequestSlice = createSlice({
  name: 'advanceRequests',
  initialState,
  reducers: {
    clearError(state) {
      state.travelSubmit.error = null;
      state.lineSubmit.error = null;
      state.imprestList = state.imprestList; // no-op placeholder if needed
    },
    // you can add more local mutations here if needed later
  },
  extraReducers: (builder) => {
    builder
      // fetch advance list
      .addCase(fetchAdvanceRequestList.pending, (state) => {
        state.fetchStatus = 'pending';
      })
      .addCase(fetchAdvanceRequestList.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.imprestList = action.payload;
      })
      .addCase(fetchAdvanceRequestList.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        // could store in a dedicated error field if you want
      })

      // fetch destination list
      .addCase(fetchDestinationList.pending, (state) => {
        state.fetchStatus = 'pending';
      })
      .addCase(fetchDestinationList.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.destinationList = action.payload;
      })
      .addCase(fetchDestinationList.rejected, (state) => {
        state.fetchStatus = 'failed';
      })

      // travel advance submission
      .addCase(submitTravelAdvanceRequest.pending, (state) => {
        state.travelSubmit.status = 'pending';
        state.travelSubmit.error = null;
        state.travelSubmit.response = null;
      })
      .addCase(submitTravelAdvanceRequest.fulfilled, (state, action) => {
        state.travelSubmit.status = 'idle';
        state.travelSubmit.response = action.payload;
      })
      .addCase(submitTravelAdvanceRequest.rejected, (state, action) => {
        state.travelSubmit.status = 'failed';
        state.travelSubmit.error =
          action.payload?.message || 'Unknown error during travel submit';
      })

      // imprest line submission
      .addCase(submitImprestLine.pending, (state) => {
        state.lineSubmit.status = 'pending';
        state.lineSubmit.error = null;
        state.lineSubmit.response = null;
      })
      .addCase(submitImprestLine.fulfilled, (state, action) => {
        state.lineSubmit.status = 'idle';
        state.lineSubmit.response = action.payload;
      })
      .addCase(submitImprestLine.rejected, (state, action) => {
        state.lineSubmit.status = 'failed';
        state.lineSubmit.error =
          action.payload?.message || 'Unknown error during line submit';
      });
  },
});

// --- Selectors ---
export const selectAdvanceImprestList = (state: RootState) => state.advanceRequests;

export const selectDestinationList = (state: RootState) => ({
  destinationList: state.advanceRequests.destinationList,
  status: state.advanceRequests.fetchStatus,
});

export const selectSubmitAdvanceRequest = (state: RootState) => ({
  status: state.advanceRequests.travelSubmit.status,
  statusResponse: state.advanceRequests.travelSubmit.response,
  error: state.advanceRequests.travelSubmit.error,
});

export const selectSubmitImprestLine = (state: RootState) => ({
  status: state.advanceRequests.lineSubmit.status,
  statusResponse: state.advanceRequests.lineSubmit.response,
  error: state.advanceRequests.lineSubmit.error,
});

// --- Exports ---
export const { clearError } = advanceRequestSlice.actions;
export default advanceRequestSlice.reducer;
