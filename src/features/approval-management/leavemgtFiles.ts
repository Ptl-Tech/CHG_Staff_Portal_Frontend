import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getPersistedTokens } from "../../utils/token";
import type { StatusRequestResponse } from "../../types/dropdown";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export interface DocumentApprovalDTO {
  entryNo: number;
  documentNo: string;
  approverID: string;
  comments: string;
}

interface ApprovalState {
  data: any;
  error: any;
  leaveApprovalRequest: DocumentApprovalDTO;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: ApprovalState = {
  data: [],
  leaveApprovalRequest: {
    entryNo: 0,
    documentNo: "",
    approverID: "",
    comments: "",
  },
  status: "idle",
  error: null,
};

export const fetchMyLeaveApprovalDocuments = createAsyncThunk<
  any[],
  { approverId: string },
  { rejectValue: { message: string } }
>(
  "leaveMgt/fetchMyLeaveApprovalDocuments",
  async ({ approverId }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const url = `${API_ENDPOINT}/LeaveApprovalMgt/my-leave-approval-documents?approverId=${encodeURIComponent(
        approverId,
      )}`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "BC-Authorization": bcToken || "",
        },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.error ||
          err.message ||
          "Failed to fetch approval documents",
      });
    }
  },
);

export const submitDocumentApproval = createAsyncThunk<
  StatusRequestResponse,
  DocumentApprovalDTO,
  { rejectValue: { message: string } }
>(
  "leaveMgt/submitDocumentApproval",
  async (payloadData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/ApprovalMgt/submit-document-approval`,
        payloadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        },
      );
      return data;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.error ||
          err.message ||
          "Failed to submit approval document",
      });
    }
  },
);

const leaveApprovalSlice = createSlice({
  name: "leaveMgt",
  initialState,
  reducers: {
    resetApprovalState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLeaveApprovalDocuments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyLeaveApprovalDocuments.fulfilled, (state, { payload }) => {
        state.data = payload;
        state.status = "succeeded";
      })
      .addCase(fetchMyLeaveApprovalDocuments.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      })
      .addCase(submitDocumentApproval.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitDocumentApproval.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(submitDocumentApproval.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      });
  },
});

export const { resetApprovalState } = leaveApprovalSlice.actions;
export default leaveApprovalSlice.reducer;
