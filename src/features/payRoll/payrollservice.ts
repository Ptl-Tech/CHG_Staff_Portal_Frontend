import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPersistedTokens } from "../../utils/token";
import axios from "axios";
import type { RootState } from "../../app/rootReducer";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface PayslipDTO {
    month: number;
    year: number;
}   

interface PayrollServiceResponse {
    baseImage: string;
    filename: string;
}

interface PayrollServiceState {
    payslip: PayrollServiceResponse | null;    
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
        error: string | null;
}

const initialState: PayrollServiceState = {
    payslip: null,    
    status: 'idle',
    error: null,
};

// Fetch payslip
export const generatePayslip = createAsyncThunk<
    PayrollServiceResponse,                  
    PayslipDTO,                               
    { rejectValue: string }       
>(
    'payroll/generatePayslip',
    async (payload , { rejectWithValue }) => {
        try {
            const { token, bcToken } = getPersistedTokens();

            const response = await axios.post(
                `${API_ENDPOINT}/Payroll/generate-payslip`,
                payload ,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'BC-Authorization': bcToken || '',
                    },
                }
            );

            return {
                baseImage: response.data.description,
                filename: `Payslip_${payload.month}_${payload.year}.pdf`
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.error || 'Failed to generate leave statement'
            );
        }
    }
);

const payrollServiceSlice = createSlice({
    name: 'payroll',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Generate Payslip
            .addCase(generatePayslip.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(generatePayslip.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.payslip = action.payload;
                state.error = null;
            })
            .addCase(generatePayslip.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to generate payslip';
            });
    },
});


export const selectGeneratedPayslip=(state:RootState) =>({
    payslip:state.payroll.payslip,
    status:state.payroll.status,
    error:state.payroll.error
});

export default payrollServiceSlice.reducer;