import { message } from 'antd';
import type { PurchaseRequisition, PurchaseLineItem, PurchaseHeader } from './../../types/purchaseRequisitions';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../../app/store';
import { getPersistedTokens } from '../../utils/token';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface PurchaseRequisitionState {
    purchaseRequests: PurchaseHeader[];
    PurchaseRequisition: PurchaseRequisition;
    requestLines: PurchaseLineItem[];
    status: 'idle' | 'pending' | 'failed';
    error: string | null;
    purchaseLineItem: PurchaseLineItem | null;
    purchaseHeader: PurchaseHeader | null;
    submitStatus: 'idle' | 'pending' | 'failed';
    submitError: string | null;
}

const initialState: PurchaseRequisitionState = {
    purchaseRequests: [],
    PurchaseRequisition: {
        header: {
            documentNo: '',
            orderDate: new Date(),
            reasonDescription: '',
            status: '',
            procurementPlan: '',
            totalAmount: 0,
        },
        procurementPlanItems: [],
    },
    requestLines: [],
    purchaseLineItem: null,
    purchaseHeader: null,
    status: 'idle',
    error: null,
    submitStatus: 'idle',
    submitError: null,
};

export const fetchPurchaseRequisitions = createAsyncThunk<
    PurchaseHeader[],
    void,
    { rejectValue: { message: string } }
>('purchaseRequests/fetchPurchaseRequisitions', async (_, { rejectWithValue }) => {
    try {
        const { token, bcToken } = getPersistedTokens();
        const { data } = await axios.get(`${API_ENDPOINT}/Procurement/all-purchases`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'BC-Authorization': bcToken || '',
            },
        });
        return data;
    } catch (err: any) {
        return rejectWithValue({
            message: err.response?.data?.message || err.message || 'Failed to fetch purchase requisitions',
        });
    }
});

export const fetchPurchaseDocument = createAsyncThunk<
    PurchaseRequisition,
    { documentNo: string },
    { rejectValue: { message: string } }
>('purchaseRequests/fetchPurchaseDocument', async ({ documentNo }, { rejectWithValue }) => {
    try {
        const { token, bcToken } = getPersistedTokens();
        const { data } = await axios.get(`${API_ENDPOINT}/Procurement/one-purchase?docNo=${documentNo}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'BC-Authorization': bcToken || '',
            },
        });

        return {
            header: {
                documentNo: data.documentNo,
                orderDate: new Date(data.orderDate),
                reasonDescription: data.reasonDescription,
                status: data.status,
                procurementPlan: data.procurementPlan,
            },
            procurementPlanItems: data.procumentPlanItems || []
        };
    } catch (err: any) {
        return rejectWithValue({ message: err.message || 'Failed to fetch Purchase document' });
    }
});

export const fetchPurchaseRequestLines = createAsyncThunk<
    PurchaseLineItem[],
    { documentNo: string },
    { rejectValue: { message: string } }
>('purchaseRequests/fetchPurchaseRequestLines', async ({ documentNo }, { rejectWithValue }) => {
    try {
        const { token, bcToken } = getPersistedTokens();
        const { data } = await axios.get(`${API_ENDPOINT}/Procurement/all-purchases-lines?docNo=${documentNo}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'BC-Authorization': bcToken || '',
            },
        });
        return data;
    } catch (err: any) {
        return rejectWithValue({ message: err.message || 'Failed to fetch line items' });
    }
});

// Submit purchase header
export const submitPurchaseHeader = createAsyncThunk<
    { message: string },
    PurchaseHeader,
    { rejectValue: { message: string } }
>('purchaseRequests/submitPurchaseHeader', async (payloadData, { rejectWithValue }) => {
    try {
        const { token, bcToken } = getPersistedTokens();
        const { data } = await axios.post(`${API_ENDPOINT}/Procurement/purchase-create`, payloadData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'BC-Authorization': bcToken || '',
            },
        });
        return data;
    } catch (err: any) {
        return rejectWithValue({
            message: err?.response?.data?.message || err?.message || 'Failed to submit purchase header',
        });
    }
});

// Create line item
export const createPurchaseLine = createAsyncThunk<
    { message: string, status: number },
    PurchaseLineItem,
    { rejectValue: { message: string } }
>('purchaseRequests/createPurchaseLine', async (lineData, { rejectWithValue }) => {
    try {
        const { token, bcToken } = getPersistedTokens();
        const { data } = await axios.post(`${API_ENDPOINT}/Procurement/add-purchase-line`, lineData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'BC-Authorization': bcToken || '',
            },
        });
        return {
            message:data.description,
            status:data.statusCode
        };
    } catch (err: any) {
        return rejectWithValue({ message: err.message || 'Line submission failed' });
    }
});

const purchaseRequestsSlice = createSlice({
    name: 'purchaseRequests',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch list
            .addCase(fetchPurchaseRequisitions.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchPurchaseRequisitions.fulfilled, (state, { payload }) => {
                state.status = 'idle';
                state.purchaseRequests = payload;
            })
            .addCase(fetchPurchaseRequisitions.rejected, (state, { payload }) => {
                state.status = 'failed';
                state.error = payload?.message ?? 'Unknown error';
            })

            // Fetch document
            .addCase(fetchPurchaseDocument.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchPurchaseDocument.fulfilled, (state, { payload }) => {
                state.status = 'idle';
                state.PurchaseRequisition = payload;
            })
            .addCase(fetchPurchaseDocument.rejected, (state, { payload }) => {
                state.status = 'failed';
                state.error = payload?.message ?? 'Unknown error';
            })

            // Fetch lines
            .addCase(fetchPurchaseRequestLines.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(fetchPurchaseRequestLines.fulfilled, (state, { payload }) => {
                state.status = 'idle';
                state.requestLines = payload;
            })
            .addCase(fetchPurchaseRequestLines.rejected, (state, { payload }) => {
                state.status = 'failed';
                state.error = payload?.message ?? 'Unknown error';
            })

            // Create line
            .addCase(createPurchaseLine.pending, (state) => {
                state.status = 'pending';
                state.error = null;
            })
            .addCase(createPurchaseLine.fulfilled, (state, { payload }) => {
                state.status = 'idle';
              state.message = payload.message;
            })
            .addCase(createPurchaseLine.rejected, (state, { payload }) => {
                state.status = 'failed';
                state.error = payload?.message ?? 'Unknown error';
            })

            // Submit header
            .addCase(submitPurchaseHeader.pending, (state) => {
                state.submitStatus = 'pending';
                state.submitError = null;
            })
            .addCase(submitPurchaseHeader.fulfilled, (state, { payload }) => {
                state.submitStatus = 'idle';
                state.message = payload;
            })
            .addCase(submitPurchaseHeader.rejected, (state, { payload }) => {
                state.submitStatus = 'failed';
                state.submitError = payload?.message ?? 'Unknown error';
            });
    },
});

export const selectPurchaseRequests = (state: RootState) => state.purchaseRequests;
export const selectPurchaseDocument = (state: RootState) => ({
    PurchaseRequisition: state.purchaseRequests.PurchaseRequisition,
    status: state.purchaseRequests.status,
    error: state.purchaseRequests.error,
});
export const selectPurchaseRequestLines = (state: RootState) => state.purchaseRequests.requestLines;
export const selectSubmitPurchaseLine = (state: RootState) => ({
    status: state.purchaseRequests.status,
    message: state.purchaseRequests.message,
    error: state.purchaseRequests.error,
});
export const selectSubmitPurchaseHeader = (state: RootState) => ({
    status: state.purchaseRequests.submitStatus,
    error: state.purchaseRequests.submitError,
    message: state.message,
});

export default purchaseRequestsSlice.reducer;
