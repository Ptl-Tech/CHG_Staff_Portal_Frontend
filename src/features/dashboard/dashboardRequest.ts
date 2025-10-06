import type { StatusRequestResponse } from "../../types/dropdown";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { UserData } from "../../types/dashboardState";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
interface OperationState {
    status: 'idle' | 'pending' | 'failed';
    response: StatusRequestResponse | null;
    error: string | null;
}

interface DashboardState {
    dashboardDetails: UserData | null;
    status: 'idle' | 'pending' | 'failed';
    error: string | null;
}

const initialState: DashboardState = {
    dashboardDetails: {} as UserData,
    status: 'idle',
    error: null,

};

export const fetchUserData = createAsyncThunk<
  UserData,
  void,
  { rejectValue: { message: string } }
>(
  'advanceSurrender/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Dashboard/user-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });

      return data as UserData;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to fetch User Data',
      });
    }
  }
);

//dashboard slice
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.status = 'idle';
                state.dashboardDetails = action.payload;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to fetch User Data';
            });
    },
});


export const selectFetchDashboardData = (state: any) => state.dashboard;

export default dashboardSlice.reducer;

