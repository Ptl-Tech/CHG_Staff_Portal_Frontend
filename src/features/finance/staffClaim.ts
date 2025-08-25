import type { ClaimLineData, PaymentData, StaffClaimDTO } from './../../types/PaymentData';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';
import type { DropdownOptions, StatusRequestResponse } from '../../types/dropdown';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface OperationState {
  status: 'idle' | 'pending' | 'failed';
  response: StatusRequestResponse | null;
  error: string | null;
}

interface StaffClaimState {
  staffClaimList: PaymentData[];
  allStaffClaimTypes: DropdownOptions[];
  allImprestSurrenders: DropdownOptions[];
  fetchStatus: 'idle' | 'pending' | 'failed';
  claimHeader: OperationState;
  claimLine: OperationState;
}

const initialOperationState: OperationState = {
  status: 'idle',
  response: null,
  error: null,
};

const initialState: StaffClaimState = {
  staffClaimList: [],
  allStaffClaimTypes: [],
  allImprestSurrenders: [],
  fetchStatus: 'idle',
  claimHeader: { ...initialOperationState },
  claimLine: { ...initialOperationState },
};

/** Fetch staff claims */
export const fetchStaffClaimList = createAsyncThunk<
  PaymentData[],
  void,
  { rejectValue: { message: string } }
>(
  'staffClaim/fetchStaffClaimList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Finance/all-claims`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch staff claims',
      });
    }
  }
);

/** Fetch dropdown data for claims */
export const fetchClaimDropdownData = createAsyncThunk<
  { allImprestSurrenders: DropdownOptions[]; allStaffClaimTypes: DropdownOptions[] },
  void,
  { rejectValue: { message: string } }
>(
  'staffClaim/fetchClaimDropdownData',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/finance/claim-dropdowns`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });

      return {
        allImprestSurrenders: data.allImprestSurrenders || [],
        allStaffClaimTypes: data.allStaffClaimTypes || [],
      };
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Dropdown fetch failed',
      });
    }
  }
);

/** Submit a new claim request */
export const submitClaimRequest = createAsyncThunk<
  StatusRequestResponse,
  StaffClaimDTO,
  { rejectValue: { message: string } }
>(
  'staffClaim/submitClaimRequest',
  async (payloadData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/Finance/claim-create`,
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
      console.log('error', err);
      return rejectWithValue({
        message:
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          'Claim request submission failed',
      });
    }
  }
);

/** Submit a claim line */
export const submitClaimLine = createAsyncThunk<
  StatusRequestResponse,
  ClaimLineData,
  { rejectValue: { message: string } }
>(
  'staffClaim/submitClaimLine',
  async (payloadData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/Finance/add-claim-lines`,
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
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Claim line submission failed',
      });
    }
  }
);

const staffClaimSlice = createSlice({
  name: 'staffClaim',
  initialState,
  reducers: {
    clearError(state) {
      state.claimHeader.error = null;
      state.claimLine.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /** Staff claim list */
      .addCase(fetchStaffClaimList.pending, (state) => {
        state.fetchStatus = 'pending';
      })
      .addCase(fetchStaffClaimList.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.staffClaimList = action.payload;
      })
      .addCase(fetchStaffClaimList.rejected, (state) => {
        state.fetchStatus = 'failed';
      })

      /** Dropdown data */
      .addCase(fetchClaimDropdownData.pending, (state) => {
        state.fetchStatus = 'pending';
      })
      .addCase(fetchClaimDropdownData.fulfilled, (state, action) => {
        state.fetchStatus = 'idle';
        state.allImprestSurrenders = action.payload.allImprestSurrenders;
        state.allStaffClaimTypes = action.payload.allStaffClaimTypes;
      })
      .addCase(fetchClaimDropdownData.rejected, (state) => {
        state.fetchStatus = 'failed';
      })

      /** Claim request header */
      .addCase(submitClaimRequest.pending, (state) => {
        state.claimHeader = { ...initialOperationState, status: 'pending' };
      })
      .addCase(submitClaimRequest.fulfilled, (state, action) => {
        state.claimHeader = { status: 'idle', response: action.payload, error: null };
      })
      .addCase(submitClaimRequest.rejected, (state, action) => {
        state.claimHeader = { status: 'failed', response: null, error: action.payload?.message || null };
      })

      /** Claim line */
      .addCase(submitClaimLine.pending, (state) => {
        state.claimLine = { ...initialOperationState, status: 'pending' };
      })
      .addCase(submitClaimLine.fulfilled, (state, action) => {
        state.claimLine = { status: 'idle', response: action.payload, error: null };
      })
      .addCase(submitClaimLine.rejected, (state, action) => {
        state.claimLine = { status: 'failed', response: null, error: action.payload?.message || null };
      });
  },
});

/** Selectors */
export const selectStaffClaimList = (state: RootState) => ({
  staffClaimList: state.staffClaim.staffClaimList,
  status: state.staffClaim.fetchStatus,
});

export const selectClaimDropdownData = (state: RootState) => ({
  allImprestSurrenders: state.staffClaim.allImprestSurrenders,
  allStaffClaimTypes: state.staffClaim.allStaffClaimTypes,
  status: state.staffClaim.fetchStatus,
});

export const selectSubmitClaimLine = (state: RootState) => ({
  status: state.staffClaim.claimLine.status,
  response: state.staffClaim.claimLine.response,
  error: state.staffClaim.claimLine.error,
});

export const selectSubmitClaimRequest = (state: RootState) => ({
  status: state.staffClaim.claimHeader.status,
  response: state.staffClaim.claimHeader.response,
  error: state.staffClaim.claimHeader.error,
});

export const { clearError } = staffClaimSlice.actions;
export default staffClaimSlice.reducer;
