// features/leave/dropdownSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';
import type { DropdownOptions } from '../../types/dropdown';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface DropdownState {
  leaveTypes: DropdownOptions[];
  relievers: DropdownOptions[];
  responsibilityCenters: DropdownOptions[];
  status: 'idle' | 'pending' | 'failed';
  error: string | null;
}

const initialState: DropdownState = {
  leaveTypes: [],
  relievers: [],
  responsibilityCenters: [],
  status: 'idle',
  error: null,
};

export const fetchLeaveDropdownData = createAsyncThunk<
  {
    leaveTypeList: DropdownOptions[];
    relieverList: DropdownOptions[];
    responsibilityCenterList: DropdownOptions[];
  },
  void,
  { rejectValue: { message: string } }
>('leave/fetchLeaveDropdownData', async (_, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.get(`${API_ENDPOINT}/Leave/application-dropdowns`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });

    return {
      leaveTypeList: data.leaveTypeList || [],
      relieverList: data.relieverList || [],
      responsibilityCenterList: data.responsibilityCenterList || [],
    };
  } catch (err: any) {
    return rejectWithValue({ message: err.message || 'Dropdown fetch failed' });
  }
});

const dropdownSlice = createSlice({
  name: 'leaveDropdowns',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveDropdownData.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchLeaveDropdownData.fulfilled, (state, { payload }) => {
        state.status = 'idle';
        state.leaveTypes = payload.leaveTypeList;
        state.relievers = payload.relieverList;
        state.responsibilityCenters = payload.responsibilityCenterList;
      })
      .addCase(fetchLeaveDropdownData.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload?.message ?? 'Unknown error';
      });
  },
});

export const selectDropdowns = (state: RootState) => state.leaveDropdowns;

export default dropdownSlice.reducer;
