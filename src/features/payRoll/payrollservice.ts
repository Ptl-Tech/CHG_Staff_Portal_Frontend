import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPersistedTokens } from "../../utils/token";
import axios from "axios";
import type { RootState } from "../../app/rootReducer";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface PayrollPeriods {
  periodName: string;
  periodStartDate: string;
}

interface PayslipDTO {
  month: number;
  year: number;
}

interface PayrollServiceResponse {
  baseImage: string;
  filename: string;
}

interface PayrollServiceState {
  payrollPeriods: PayrollPeriods[];
  payslip: PayrollServiceResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PayrollServiceState = {
  payrollPeriods: [],
  payslip: null,
  status: "idle",
  error: null,
};

export const fetchPayRollPeriods = createAsyncThunk<
  { payrollPeriods: PayrollPeriods[] },
  void,
  { rejectValue: { message: string } }
>("payroll/fetchPayRollPeriods", async (_, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.get(`${API_ENDPOINT}/Payroll/Payroll-Periods`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "BC-Authorization": bcToken || "",
      },
    });

    return {
      payrollPeriods: data || [],
    };
  } catch (err: any) {
    return rejectWithValue({ message: err.message || "Dropdown fetch failed" });
  }
});

// Generate Payslip
export const generatePayslip = createAsyncThunk<
  PayrollServiceResponse,
  PayslipDTO,
  { rejectValue: { message: string } }
>("payroll/generatePayslip", async (payload, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const response = await axios.post(
      `${API_ENDPOINT}/Payroll/generate-payslip`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "BC-Authorization": bcToken || "",
        },
      }
    );

    return {
      baseImage: response.data.description,
      filename: `Payslip_${payload.month}_${payload.year}.pdf`,
    };
  } catch (error: any) {
    return rejectWithValue({
      message: error.response?.data?.error || "Failed to generate payslip",
    });
  }
});

// --- Slice ---
const payrollServiceSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Payroll Periods
      .addCase(fetchPayRollPeriods.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPayRollPeriods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.payrollPeriods = action.payload.payrollPeriods;
        state.error = null;
      })
      .addCase(fetchPayRollPeriods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to fetch payroll periods";
      })
      // Generate Payslip
      .addCase(generatePayslip.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(generatePayslip.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.payslip = action.payload;
        state.error = null;
      })
      .addCase(generatePayslip.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to generate payslip";
      });
  },
});

export const selectGeneratedPayslip = (state: RootState) => ({
  payslip: state.payroll.payslip,
  status: state.payroll.status,
  error: state.payroll.error,
});

export const selectPayrollPeriods = (state: RootState) => ({
  payrollPeriods: state.payroll.payrollPeriods,
  status: state.payroll.status,
  error: state.payroll.error,
});

export default payrollServiceSlice.reducer;
