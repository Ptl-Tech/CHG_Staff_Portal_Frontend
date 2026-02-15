import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { approveLeaveRequest } from "./approveLeaveRequest";

interface ApproveLeaveState {
  data: {
    status: number;
    statusCode: number;
    description: string;
  } | null;
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ApproveLeaveState = {
  data: null,
  status: "idle",
  error: null,
};

const approveLeaveSlice = createSlice({
  name: "approveLeave",
  initialState,
  reducers: {
    resetApproveLeaveState: (state) => {
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(approveLeaveRequest.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(approveLeaveRequest.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.data = payload;
      })
      .addCase(approveLeaveRequest.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload?.message ?? "Unknown error";
      });
  },
});

export const { resetApproveLeaveState } = approveLeaveSlice.actions;
export const selectApproveLeave = (state: RootState) => state.approveLeave;
export default approveLeaveSlice.reducer;
