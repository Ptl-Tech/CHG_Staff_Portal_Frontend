import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

// Types
interface DeleteLineParams {
  docNo: string;
  lineNo: number;
  endpoint: string;
}

interface Response {
  statusCode: number;
  description: string;
}

interface DeleteLineItemState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  message: string | null;
  error: string | null;
}

// Initial state
const initialState: DeleteLineItemState = {
  status: 'idle',
  message: null,
  error: null,
};

export const deleteLineItem = createAsyncThunk<
  Response, // Success return type
  DeleteLineParams, // Payload type
  { rejectValue: { message: string } } // Reject payload type
>(
  'delete/deleteLineItem',
  async ({ docNo, lineNo, endpoint }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();

      const { data } = await axios.delete(
        `${API_ENDPOINT}${endpoint}?docNo=${encodeURIComponent(docNo)}&lineNo=${encodeURIComponent(lineNo)}`,
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
        err?.response?.data?.message ||  err?.response?.data?.error ||
        err?.message ||
        'Failed to delete line item';
      return rejectWithValue({ message: msg });
    }
  }
);


// Slice
const deleteLineItemSlice = createSlice({
  name: 'delete/deleteLineItem',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteLineItem.pending, (state) => {
        state.status = 'loading';
        state.message = null;
        state.error = null;
      })
      .addCase(deleteLineItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.description;
        state.error = null;
      })
      .addCase(deleteLineItem.rejected, (state, action) => {
        state.status = 'failed';
        state.message = null;
        state.error = action.payload?.message || 'Something went wrong';
      });
  },
});

// Selector
export const selectDeleteLine = (state: RootState) =>({
  status: state.delete.status,
  message: state.delete.message,
  error: state.delete.error
})
  

// Reducer export
export default deleteLineItemSlice.reducer;
