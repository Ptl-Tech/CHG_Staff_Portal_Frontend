import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../../app/store";
import { getPersistedTokens } from "../../utils/token";
import type { LeaveApplication } from "./../../types/leave";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface LeaveApplicationState {
  data: LeaveApplication | null;
  status: "idle" | "pending" | "failed";
  error: string | null;
}

const initialState: LeaveApplicationState = {
  data: null,
  status: "idle",
  error: null,
};
interface SubmitLeaveApplicationResponse {
  docNo: string;
  leaveNo: string;
  returnDate: string;
  endDate: string | null;
  responseDTO: {
    statusCode: number;
    description: string;
    status: string;
  };
}

export const submitLeaveApplication = createAsyncThunk<
  SubmitLeaveApplicationResponse,
  LeaveApplication,
  { rejectValue: { message: string } }
>("leave/submitLeaveApplication", async (payload, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.post(
      `${API_ENDPOINT}/leave/complete-application`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "BC-Authorization": bcToken || "",
        },
      },
    );

    return data as SubmitLeaveApplicationResponse;
  } catch (err: any) {
    console.log("error", err);
    return rejectWithValue({
      message:
        err.response.data.error ||
        err.message ||
        "Failed to complete leave application",
    });
  }
});

const leaveApplicationSlice = createSlice({
  name: "leaveApplication",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitLeaveApplication.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(submitLeaveApplication.fulfilled, (state, { payload }) => {
        state.status = "idle";
        state.data = payload;
      })
      .addCase(submitLeaveApplication.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload?.message ?? "Unknown error";
      });
  },
});

export const selectLeaveApplication = (state: RootState) =>
  state.leaveApplication;
export default leaveApplicationSlice.reducer;
