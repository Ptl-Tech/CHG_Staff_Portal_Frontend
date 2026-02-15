import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPersistedTokens } from "../../utils/token";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

type CancelApprovalResponse = {
  status: number;
  statusCode: number;
  description: string;
};

export const cancelLeaveRequest = createAsyncThunk<
  CancelApprovalResponse,
  { leaveNo: string },
  { rejectValue: { message: string } }
>("leaveApproval/cancelLeave", async ({ leaveNo }, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.post(
      `${API_ENDPOINT}/LeaveApprovalMgt/cancel-leave-approval`,
      { LeaveNo: leaveNo },
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
        err.response.data.error ||
        err.message ||
        "Failed to complete leave application",
    });
  }
});
