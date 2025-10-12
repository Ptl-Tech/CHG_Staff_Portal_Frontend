import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getPersistedTokens } from '../../utils/token';
import type { RootState } from '../../app/store';
import type { ProcurementPlans } from '../../types/purchaseRequisitions';


const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface ProcurementPlansState {
    procurementPlans: ProcurementPlans[];
    status: 'idle' | 'pending' | 'failed';
    error: string | null;
}

const initialState: ProcurementPlansState = {
    procurementPlans: [],
    status: 'idle',
    error: null,
};

// Thunk for fetching the dropdown data
export const fetchPurchaseDropdownData = createAsyncThunk<
    { procurementPlans: ProcurementPlans[] },
    void,
    { rejectValue: { message: string } }
>('procurementPlans/fetchDropdown', async (_, { rejectWithValue }) => {
    try {
        const { token, bcToken } = getPersistedTokens();

        const { data } = await axios.get(`${API_ENDPOINT}/Procurement/procurement-dropdowns`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'BC-Authorization': bcToken || '',
            },
        });

        return {
            procurementPlans: data,
        };
    } catch (err: any) {
        return rejectWithValue({ message: err.message || 'Dropdown fetch failed' });
    }
});

const procurementPlansSlice = createSlice({
    name: 'procurementPlans',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPurchaseDropdownData.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchPurchaseDropdownData.fulfilled, (state, { payload }) => {
                state.status = 'idle';
                state.procurementPlans = payload.procurementPlans;
            })
            .addCase(fetchPurchaseDropdownData.rejected, (state, { payload }) => {
                state.status = 'failed';
                state.error = payload?.message || 'Failed to fetch procurement plans';
            });
    },
});

export const selectProcurementPlans = (state: RootState) => state.procurementPlans;

export default procurementPlansSlice.reducer;
