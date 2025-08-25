// features/finance/commonRequest.ts
import type { ClaimLineData, ImprestSurrenderLineData, PaymentData, PaymentLinesData } from './../../types/PaymentData';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface PaymentsRequestState {
  document: PaymentData | null;
  documentLines: ClaimLineData[]; // keep as array to satisfy table expectations
  status: 'idle' | 'pending' | 'failed';
  surrenderLines:ImprestSurrenderLineData[];
  imprestLines:PaymentLinesData[]
  error: string | null;
  linesStatus: 'idle' | 'pending' | 'failed';
  linesError: string | null;
}

const initialState: PaymentsRequestState = {
  document: null,
  documentLines: [],
  surrenderLines:[],
  imprestLines:[],
  status: 'idle',
  error: null,
  linesStatus: 'idle',
  linesError: null,
};

export const fetchPaymentDocument = createAsyncThunk<
  PaymentData,
  { documentNo: string |null },
  { rejectValue: { message: string } }
>(
  'paymentsRequest/fetchPaymentDocument',
  async ({ documentNo }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const url = `${API_ENDPOINT}/Finance/one-payment?docNo=${encodeURIComponent(
        documentNo
      )}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data as PaymentData;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch payment document',
      });
    }
  }
);

export const fetchPaymentDocumentLines = createAsyncThunk<
  ClaimLineData[],
  { documentNo: string },
  { rejectValue: { message: string } }
>(
  'paymentsRequest/fetchPaymentDocumentLines',
  async ({ documentNo }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const url = `${API_ENDPOINT}/Finance/all-payment-lines?docNo=${encodeURIComponent(
        documentNo
      )}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      // Ensure we return an array; defensive fallback
      return data as ClaimLineData[];
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch payment lines',
      });
    }
  }
);


export const fetchSurrenderLines = createAsyncThunk<
  ImprestSurrenderLineData[],
  { documentNo: string },
  { rejectValue: { message: string } }
>(
  'paymentsRequest/fetchSurrenderLines',
  async ({ documentNo }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const url = `${API_ENDPOINT}/Finance/all-payment-lines?docNo=${encodeURIComponent(
        documentNo
      )}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      // Ensure we return an array; defensive fallback
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch payment lines',
      });
    }
  }
);

export const fetchImprestLines = createAsyncThunk<
  PaymentLinesData[],
  { documentNo: string },
  { rejectValue: { message: string } }
>(
  'paymentsRequest/fetchImprestLines',
  async ({ documentNo }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const url = `${API_ENDPOINT}/Finance/all-payment-lines?docNo=${encodeURIComponent(
        documentNo
      )}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      // Ensure we return an array; defensive fallback
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch payment lines',
      });
    }
  }
);

const paymentsRequestSlice = createSlice({
  name: 'paymentsRequest',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearDocument(state) {
      state.document = null;
      state.status = 'idle';
      state.error = null;
    },
    clearLinesError(state) {
      state.linesError = null;
    },
    clearDocumentLines(state) {
      state.documentLines = [];
      state.linesStatus = 'idle';
      state.linesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // document
      .addCase(fetchPaymentDocument.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(
        fetchPaymentDocument.fulfilled,
        (state, action) => {
          state.status = 'idle';
          state.document = action.payload;
        }
      )
      .addCase(
        fetchPaymentDocument.rejected,
        (state, action: ReturnType<typeof fetchPaymentDocument.rejected>) => {
          state.status = 'failed';
          state.error = action.payload?.message || 'Unknown error';
        }
      )
      // document lines
      .addCase(fetchPaymentDocumentLines.pending, (state) => {
        state.linesStatus = 'pending';
        state.linesError = null;
      })
      .addCase(
        fetchPaymentDocumentLines.fulfilled,
        (state, action) => {
          state.linesStatus = 'idle';
          state.documentLines = action.payload;
        }
      )
      .addCase(
        fetchPaymentDocumentLines.rejected,
        (state, action: ReturnType<typeof fetchPaymentDocumentLines.rejected>) => {
          state.linesStatus = 'failed';
          state.linesError = action.payload?.message || 'Unknown error';
        }
      )
      // document lines
      .addCase(fetchSurrenderLines.pending, (state) => {
        state.linesStatus = 'pending';
        state.linesError = null;
      })
      .addCase(
        fetchSurrenderLines.fulfilled,
        (state, action) => {
          state.linesStatus = 'idle';
          state.surrenderLines = action.payload;
        }
      )
      .addCase(
        fetchSurrenderLines.rejected,
        (state, action: ReturnType<typeof fetchSurrenderLines.rejected>) => {
          state.linesStatus = 'failed';
          state.linesError = action.payload?.message || 'Unknown error';
        }
      )
      .addCase(fetchImprestLines.pending, (state) => {
        state.linesStatus = 'pending';
        state.linesError = null;
      })
      .addCase(
        fetchImprestLines.fulfilled,
        (state, action) => {
          state.linesStatus = 'idle';
          state.imprestLines = action.payload;
        }
      )
      .addCase(
        fetchImprestLines.rejected,
        (state, action: ReturnType<typeof fetchImprestLines.rejected>) => {
          state.linesStatus = 'failed';
          state.linesError = action.payload?.message || 'Unknown error';
        }
      );
  },
});

// --- Selectors ---
export const selectPaymentDocument = (state: RootState) => ({
  document: state.paymentsRequest.document,
  status: state.paymentsRequest.status,
  error: state.paymentsRequest.error,
});

export const selectPaymentLines = (state: RootState) => ({
  documentLines: state.paymentsRequest.documentLines,
  status: state.paymentsRequest.linesStatus,
  error: state.paymentsRequest.linesError,
});

export const selectSurrenderLines=(state:RootState)=>({
  surrenderLines:state.paymentsRequest.surrenderLines,
  status:state.paymentsRequest.linesStatus,
  error:state.paymentsRequest.linesError
})

export const selectImprestLines=(state:RootState)=>({
  imprestLines:state.paymentsRequest.imprestLines,
  status:state.paymentsRequest.linesStatus,
  error:state.paymentsRequest.linesError
})

// --- Exports ---
export const {
  clearError,
  clearDocument,
  clearLinesError,
  clearDocumentLines,
} = paymentsRequestSlice.actions;
export default paymentsRequestSlice.reducer;
