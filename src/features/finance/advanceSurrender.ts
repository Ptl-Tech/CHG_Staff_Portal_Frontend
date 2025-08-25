import type { ImprestDocuments, ImprestSurrenderLineData, PaymentData } from './../../types/PaymentData';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';
import type { StatusRequestResponse } from '../../types/dropdown';
import { message } from 'antd';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

// --- State Types ---
interface OperationState {
  status: 'idle' | 'pending' | 'failed';
  response: StatusRequestResponse | null;
  error: string | null;
}

interface AdvanceSurrenderState {
  imprestSurrenderList: PaymentData[];
  imprestList: ImprestDocuments[];
  fetchStatus: 'idle' | 'pending' | 'failed';
  imprestSurrender: OperationState;
  lineSubmit: OperationState;
}

const initialOperationState: OperationState = {
  status: 'idle',
  response: null,
  error: null,
};

const initialState: AdvanceSurrenderState = {
  imprestSurrenderList: [],
  imprestList: [],
  fetchStatus: 'idle',
  lineSubmit: { ...initialOperationState },
  imprestSurrender: { ...initialOperationState },
};

// --- Error extractor helper ---
const extractErrorMessage = (err: unknown, defaultMsg: string): string => {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as any).response?.data === 'object'
  ) {
    const data = (err as any).response?.data;
    return data?.error || data?.message || defaultMsg;
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as any).message);
  }
  return defaultMsg;
};

// --- Thunks ---
export const fetchAdvanceSurrenderList = createAsyncThunk<
  PaymentData[],
  void,
  { rejectValue: { message: string } }
>(
  'advanceSurrender/fetchAdvanceSurrenderList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Finance/all-imprest-surrenders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data as PaymentData[];
    } catch (err: unknown) {
      return rejectWithValue({
        message: extractErrorMessage(err, 'Failed to fetch advance surrender requisitions'),
      });
    }
  }
);

export const fetchImprestList = createAsyncThunk<
  ImprestDocuments[],
  void,
  { rejectValue: { message: string } }
>(
  'advanceSurrender/fetchImprestList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Finance/imprest-dropdowns`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data as ImprestDocuments[];
    } catch (err: unknown) {
      return rejectWithValue({
        message: extractErrorMessage(err, 'Failed to fetch Imprest List'),
      });
    }
  }
);

export const submitImprestSurrender = createAsyncThunk<
  StatusRequestResponse,
  ImprestDocuments,
  { rejectValue: { message: string } }
>(
  'advanceSurrender/submitImprestSurrender',
  async (payloadData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/Finance/imprest-surrender-create`,
        payloadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'BC-Authorization': bcToken || '',
          },
        }
      );
      return data;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to submit Imprest Surrender');
      message.error(msg);
      return rejectWithValue({ message: msg });
    }
  }
);

export const submitSurrenderLine = createAsyncThunk<
  StatusRequestResponse,
  ImprestSurrenderLineData,
  { rejectValue: { message: string } }
>(
  'advanceSurrender/submitSurrenderLine',
  async (payloadData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/Finance/update-surrender-lines`,
        payloadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'BC-Authorization': bcToken || '',
          },
        }
      );
      return data;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Advance Surrender Line submission failed');
      message.error(msg);
      return rejectWithValue({ message: msg });
    }
  }
);

// --- Slice ---
const advanceSurrenderSlice = createSlice({
  name: 'advanceSurrender',
  initialState,
  reducers: {
    clearError(state) {
      state.lineSubmit.error = null;
      state.imprestSurrender.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Advance Surrender List
      .addCase(fetchAdvanceSurrenderList.pending, (state) => {
        state.fetchStatus = 'pending';
      })
      .addCase(fetchAdvanceSurrenderList.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.imprestSurrenderList = action.payload;
      })
      .addCase(fetchAdvanceSurrenderList.rejected, (state, action) => {
        state.fetchStatus = 'failed';
      })

      // Fetch Imprest List
      .addCase(fetchImprestList.pending, (state) => {
        state.fetchStatus = 'pending';
      })
      .addCase(fetchImprestList.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.imprestList = action.payload;
      })
      .addCase(fetchImprestList.rejected, (state) => {
        state.fetchStatus = 'failed';
      })

      // Submit Surrender Line
      .addCase(submitSurrenderLine.pending, (state) => {
        state.lineSubmit.status = 'pending';
      })
      .addCase(submitSurrenderLine.fulfilled, (state, action) => {
        state.lineSubmit.status = 'idle';
        state.lineSubmit.response = action.payload;
      })
      .addCase(submitSurrenderLine.rejected, (state, action) => {
        state.lineSubmit.status = 'failed';
        state.lineSubmit.error = action.payload?.message || null;
      })

      // Submit Imprest Surrender
      .addCase(submitImprestSurrender.pending, (state) => {
        state.imprestSurrender.status = 'pending';
      })
      .addCase(submitImprestSurrender.fulfilled, (state, action) => {
        state.imprestSurrender.status = 'idle';
        state.imprestSurrender.response = action.payload;
      })
      .addCase(submitImprestSurrender.rejected, (state, action) => {
        state.imprestSurrender.status = 'failed';
        state.imprestSurrender.error = action.payload?.message || null;
      });
  },
});

// --- Selectors ---
export const selectAdvanceSurrenderList = (state: RootState) => state.advanceSurrender;

export const selectImprestList = (state: RootState) => ({
  imprestList: state.advanceSurrender.imprestList,
  status: state.advanceSurrender.fetchStatus,
});

export const selectSubmitSurrenderLine = (state: RootState) => ({
  status: state.advanceSurrender.lineSubmit.status,
  response: state.advanceSurrender.lineSubmit.response,
  error: state.advanceSurrender.lineSubmit.error,
});

export const selectSubmitImprestSurrender = (state: RootState) => ({
  status: state.advanceSurrender.imprestSurrender.status,
  response: state.advanceSurrender.imprestSurrender.response,
  error: state.advanceSurrender.imprestSurrender.error,
});

// --- Exports ---
export const { clearError } = advanceSurrenderSlice.actions;
export default advanceSurrenderSlice.reducer;
