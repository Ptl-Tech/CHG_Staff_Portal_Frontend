import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { VehicleRequest } from './../../types/VehicleRequest';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import { message } from 'antd';
import type { RootState } from '../../app/store';
import type { StatusRequestResponse } from '../../types/dropdown';


const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;



interface VehicleRequestState {
  list: VehicleRequest[];
  status: 'idle' | 'pending' | 'failed';
  error: string | null;
  vehicleRequestPayload: VehicleRequest;
  document:VehicleRequest;
  vehicleRequestResponse:StatusRequestResponse;

}

const initialState: VehicleRequestState = {
  list: [],
  vehicleRequestPayload: {} as VehicleRequest,
  document:{} as VehicleRequest,
  vehicleRequestResponse:{} as StatusRequestResponse,
  status: 'idle',
  error: null,
};

// Fixing the generic types of createAsyncThunk
export const fetchVehicleRequestList = createAsyncThunk<
  VehicleRequest[],                          // Return type
  void,                                      // Argument to thunk
  { rejectValue: { message: string } }       // Rejected value type (corrected from rejectWithValue -> rejectValue)
>(
  'vehicle/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Logistics/fleet/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,   // Added space after Bearer
          'BC-Authorization': bcToken || '',
        },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch Vehicle requisitions',
      });
    }
  }
);

export const submitVehicleRequest = createAsyncThunk<
  {
    statusCode: number;
    description: string;
    status: string;
  },
  VehicleRequest,
  { rejectValue: { message: string } }
>('vehicle/submitVehicleRequest', async (payloadData, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const { data } = await axios.post(`${API_ENDPOINT}/Logistics/submit-VehicleRequest`, payloadData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });
    return data; // 👈 returns the full object: {statusCode, description, status}
  } catch (err: any) {
    message.error(err?.response?.data?.message || 'Vehicle Request submission failed');
    return rejectWithValue({ message: err.message || 'Vehicle Request submission failed' });
  }
});
export const fetchVehicleRequest = createAsyncThunk<
  VehicleRequest,
  string,
  { rejectValue: { message: string } }
>(
  'vehicle/fetchVehicleRequest',
  async (documentNo, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Logistics/fleet-request?documentNo=${documentNo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || 'Failed to fetch Vehicle request' });
    }
  }
);

const VehicleRequestSlice = createSlice({
  name: 'vehicleRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleRequestList.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchVehicleRequestList.fulfilled, (state, action) => {
        state.status = 'idle';
        state.list = action.payload;
      })
      .addCase(fetchVehicleRequestList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? null;
      })
      .addCase(submitVehicleRequest.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(submitVehicleRequest.fulfilled, (state, action) => {
        state.status = 'idle';
        state.vehicleRequestResponse = action.payload;
      })
      .addCase(submitVehicleRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? null;
      })
      .addCase(fetchVehicleRequest.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchVehicleRequest.fulfilled, (state, action) => {
        state.status = 'idle';
        state.document = action.payload;
      })
      .addCase(fetchVehicleRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? null;
      });
  }
});

export const selectedVehicleRequestList = (state: RootState) => state.vehicleRequests;
export const selectVehicleRequest=(state:RootState)=>({
  status:state.vehicleRequests.status,
  document:state.vehicleRequests.document,
  error:state.vehicleRequests.error
});

export const selectSubmitVehicleRequest=(state:RootState)=>({
  status:state.vehicleRequests.status,
  vehicleRequestResponse:state.vehicleRequests.vehicleRequestResponse,
  error:state.vehicleRequests.error
})
export default VehicleRequestSlice.reducer