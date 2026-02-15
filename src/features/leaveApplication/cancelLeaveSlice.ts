import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { cancelLeaveRequest } from "./cancelLeaveRequest";

interface CancelLeaveState {
  data: {
    status: number;
    statusCode: number;
    description: string;
  } | null;
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CancelLeaveState = {
  data: null,
  status: "idle",
  error: null,
};

const cancelLeaveSlice = createSlice({
  name: "cancelLeave",
  initialState,
  reducers: {
    resetCancelLeaveState: (state) => {
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cancelLeaveRequest.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(cancelLeaveRequest.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.data = payload;
      })
      .addCase(cancelLeaveRequest.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload?.message ?? "Unknown error";
      });
  },
});

export const { resetCancelLeaveState } = cancelLeaveSlice.actions;
export const selectCancelLeave = (state: RootState) => state.cancelLeave;
export default cancelLeaveSlice.reducer;
