import type { Destination } from './../../types/PaymentData';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';
import type { DropdownOptions, StatusRequestResponse } from '../../types/dropdown';
import { message } from 'antd';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export interface ImprestData {
  paymentNo: string;
  dateRequested: string;
  employeeNo: string;
  status: string;
  purpose: string;
  releaseDate: string;
  totalAmount: number;
  responsibilityCenter: string;
  listOfExpenditureTypes: DropdownOptions[];
}

export interface ImprestLinesData {
  lineNo: number;
  documentNo: string;
  expenditureType: string;
  accountNo: string;
  accountName: string;
  lineAmount: number;
}

interface ImprestRequestPayload {
  docNo: string;
  dateRequested: string;
  employeeNo: string;
  responsibilityCenter: string;
  purpose: string;
}

export interface ImprestLinesPayload {
  documentNo: string;
  lineNo: number;
  expenditureType: string;
  amount: number;
}

interface OperationState {
  status: 'idle' | 'pending' | 'failed';
  response: StatusRequestResponse | null;
  error: string | null;
}

interface AdvanceRequestState {
  imprestList: ImprestData[];
  imprestLines: ImprestLinesData[];
  imprestDocument: ImprestData | null;
  imprestPayload: ImprestRequestPayload | null;
  destinationList: Destination[];
  imprestLinePayload: ImprestLinesData | null;

  fetchListStatus: 'idle' | 'pending' | 'failed';
  fetchDocumentStatus: 'idle' | 'pending' | 'failed';
  fetchLinesStatus: 'idle' | 'pending' | 'failed';

  travelSubmit: OperationState;
  lineSubmit: OperationState;

  error: string | null;
}

const initialOperationState: OperationState = {
  status: 'idle',
  response: null,
  error: null,
};

const initialState: AdvanceRequestState = {
  imprestList: [],
  imprestLines: [],
  imprestDocument: null,
  imprestPayload: null,
  destinationList: [],
  imprestLinePayload: null,
  fetchListStatus: 'idle',
  fetchDocumentStatus: 'idle',
  fetchLinesStatus: 'idle',
  travelSubmit: { ...initialOperationState },
  lineSubmit: { ...initialOperationState },
  error: null,
};


export const fetchAdvanceRequestList = createAsyncThunk<
  ImprestData[],
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
      return data as ImprestData[];
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

export const fetchImprestDocument = createAsyncThunk<
  ImprestData,
  { documentNo: string },
  { rejectValue: { message: string } }
>(
  'advance/fetchImprestDocument',
  async ({ documentNo }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const url = `${API_ENDPOINT}/Finance/Imprest-Document?docNo=${encodeURIComponent(documentNo)}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data as ImprestData;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch Imprest document',
      });
    }
  }
);

export const fetchImprestLine = createAsyncThunk<
  ImprestLinesData[],
  { documentNo: string },
  { rejectValue: { message: string } }
>(
  'advance/fetchImprestLine',
  async ({ documentNo }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const url = `${API_ENDPOINT}/Finance/all-imprest-lines?docNo=${encodeURIComponent(documentNo)}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });

      console.log('data', data);
      return data as ImprestLinesData[];
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch Imprest Lines',
      });
    }
  }
);

export const submitTravelAdvanceRequest = createAsyncThunk<
  StatusRequestResponse,
  ImprestRequestPayload,
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
      console.log("error", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to submit Imprest Request';
      message.error(msg);
      return rejectWithValue({ message: msg });
    }
  }
);

export const submitImprestLine = createAsyncThunk<
  StatusRequestResponse,
  ImprestLinesPayload,
  { rejectValue: { message: string } }
>(
  'advance/submitImprestLine',
  async (payloadData, { rejectWithValue }) => {
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
      return {
        ...data,
        status: data.status,
        description: data.description,
      } as StatusRequestResponse;
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors ||
        err?.response?.data?.error||
        err?.message ||
        'Imprest Line submission failed';
      message.error(msg);
      return rejectWithValue({ message: msg });
    }
  }
);

const advanceRequestSlice = createSlice({
  name: 'advanceRequests',
  initialState,
  reducers: {
    clearError(state) {
      state.travelSubmit.error = null;
      state.lineSubmit.error = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvanceRequestList.pending, (state) => {
        state.fetchListStatus = 'pending';
      })
      .addCase(fetchAdvanceRequestList.fulfilled, (state, action) => {
        state.fetchListStatus = 'idle';
        state.imprestList = action.payload;
      })
      .addCase(fetchAdvanceRequestList.rejected, (state, action) => {
        state.fetchListStatus = 'failed';
        state.error = action.payload?.message || 'Failed to fetch advance list';
      })

      .addCase(fetchImprestDocument.pending, (state) => {
        state.fetchDocumentStatus = 'pending';
      })
      .addCase(fetchImprestDocument.fulfilled, (state, action) => {
        state.fetchDocumentStatus = 'idle';
        state.imprestDocument = action.payload;
      })
      .addCase(fetchImprestDocument.rejected, (state, action) => {
        state.fetchDocumentStatus = 'failed';
        state.error = action.payload?.message || 'Failed to fetch imprest document';
      })

      .addCase(fetchImprestLine.pending, (state) => {
        state.fetchLinesStatus = 'pending';
      })
      .addCase(fetchImprestLine.fulfilled, (state, action) => {
        state.fetchLinesStatus = 'idle';
        state.imprestLines = action.payload;
      })
      .addCase(fetchImprestLine.rejected, (state, action) => {
        state.fetchLinesStatus = 'failed';
        state.error = action.payload?.message || 'Failed to fetch imprest lines';
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

export const selectAdvanceImprestList = (state: RootState) => ({
  imprestList: state.advanceRequests.imprestList,
  status: state.advanceRequests.fetchListStatus,
  error: state.advanceRequests.error,
});

export const selectImprestDocument = (state: RootState) => ({
  imprestDocument: state.advanceRequests.imprestDocument,
  status: state.advanceRequests.fetchDocumentStatus,
  error: state.advanceRequests.error,
});

export const selectImprestLines = (state: RootState) => ({
  imprestLines: state.advanceRequests.imprestLines,
  status: state.advanceRequests.fetchLinesStatus,
  error: state.advanceRequests.error,
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

export const { clearError } = advanceRequestSlice.actions;
export default advanceRequestSlice.reducer;
