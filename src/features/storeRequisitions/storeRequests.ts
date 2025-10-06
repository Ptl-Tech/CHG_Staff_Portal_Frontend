import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPersistedTokens } from "../../utils/token";
import axios from "axios";
import type { RootState } from "../../app/rootReducer";
import type { DropdownOptions, ItemsOptions, StatusRequestResponse } from "../../types/dropdown";
import { message } from "antd";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export type StoreRequisition = {
  documentNo: string;
  documentDate: string;
  expectedReceiptDate: string;
  location: string;
  reason: string;
  status: string;
  totalAmount: number;
  requisitionType: string;
};

export type StoreReqHeader = {
  docNo: string;
  requestType: number;
  requestDate: string;
  requestDescription: string;
};

export interface StoreReqLine {
  lineNo: number;
  documentNo: string;
  itemNo: string;
  ItemDescription: string;
  specification: string;
  quantityinStock: number;
  quantityIssued: number;
  quantity: number;
  uom: string;
}


export interface StoreReqLineDTO {
  lineNo: number;
  documentNo: string;
  itemType: number;
  itemNo: string;
  location: string;
  quantity: number;

}

interface StoreRequisitionState {
  storeRequests: StoreRequisition[];
  requestHeader: StoreReqHeader | null;
  requestLines: StoreReqLine[];
  issuingStoreSetup: DropdownOptions[];
  itemCategorySetup: DropdownOptions[];
  itemsListSetup: ItemsOptions[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  response: StatusRequestResponse | null;

}

const initialState: StoreRequisitionState = {
  storeRequests: [],
  requestHeader: null,
  requestLines: [],
  issuingStoreSetup: [],
  itemCategorySetup: [],
  itemsListSetup: [],
  status: "idle",
  error: null,
  response: null,
};

export const fetchStoreRequisitions = createAsyncThunk<
  StoreRequisition[],
  void,
  { rejectValue: { message: string } }
>("storeRequests/fetchStoreRequisitions", async (_, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const { data } = await axios.get(`${API_ENDPOINT}/procurement/all-storesRequests`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "BC-Authorization": bcToken || "",
      },
    });
    return data;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.message || err.message || "Store requisitions fetch failed",
    });
  }
});

export const fetchStoreRequestDocument = createAsyncThunk<
  StoreReqHeader,
  { documentNo: string | null },
  { rejectValue: { message: string } }
>("storeRequests/fetchStoreRequestDocument", async ({ documentNo }, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const url = `${API_ENDPOINT}/Procurement/one-store-request?docNo=${encodeURIComponent(documentNo || "")}`;
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "BC-Authorization": bcToken || "",
      },
    });
    return data as StoreReqHeader;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.message || err.message || "Failed to fetch store request document",
    });
  }
});

export const fetchStoreRequestLines = createAsyncThunk<
  StoreReqLine[],
  { documentNo: string },
  { rejectValue: { message: string } }
>("storeRequests/fetchStoreRequestLines", async ({ documentNo }, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const url = `${API_ENDPOINT}/Procurement/all-store-lines?docNo=${encodeURIComponent(documentNo)}`;
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "BC-Authorization": bcToken || "",
      },
    });
    return data;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.message || err.message || "Failed to fetch store request lines",
    });
  }
});

export const fetchStoreReqDropDowns = createAsyncThunk<
  {
    issuingStoreSetup: DropdownOptions[];
    itemsListSetup: ItemsOptions[];
  },
  void, 
  { rejectValue: { message: string } }
>(
  "storeRequests/fetchStoreReqDropDowns",
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const url = `${API_ENDPOINT}/Procurement/store-dropdowns`;

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "BC-Authorization": bcToken || "",
        },
      });
      return {
        issuingStoreSetup: data.storeSetup,
        itemsListSetup: data.itemsList
      }
    } catch (err: any) {
      return rejectWithValue({
        message:
          err?.response?.data?.message ||
          err.message ||
          "Failed to fetch store request dropdowns",
      });
    }
  }
);

export const submitStoreRequest = createAsyncThunk<
  StatusRequestResponse,
  StoreReqHeader,
  { rejectValue: { message: string } }
>("storeRequests/submitStoreRequest", async (storeReqHeader, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const url = `${API_ENDPOINT}/Procurement/submit-store-request`;
    const { data } = await axios.post(url, storeReqHeader, {
      headers: {
        Authorization: `Bearer ${token}`,
        "BC-Authorization": bcToken || "",
      },
    });
    return data;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.error || err.message || "Failed to submit store request",
    });
  }
});


export const submitStoreLineRequest = createAsyncThunk<
  StatusRequestResponse,
  StoreReqLineDTO,
  { rejectValue: { message: string } }
>("storeRequests/submitStoreLineRequest", async (storeReqLine, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const url = `${API_ENDPOINT}/Procurement/add-store-line`;
    const { data } = await axios.post(url, storeReqLine, {
      headers: {
        Authorization: `Bearer ${token}`,
        "BC-Authorization": bcToken || "",
      },
    });
    return data;
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.error || err.message || "Failed to submit store request",
    });
  }
});





const storeRequisitionSlice = createSlice({
  name: "storeRequests",
  initialState,
  reducers: {
    resetState: () => initialState, 
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreRequisitions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStoreRequisitions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.storeRequests = action.payload;
      })
      .addCase(fetchStoreRequisitions.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Store requisitions fetch failed";
      })
      .addCase(fetchStoreRequestDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStoreRequestDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.requestHeader = action.payload;
      })
      .addCase(fetchStoreRequestDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to fetch store request document";
      })
      .addCase(fetchStoreRequestLines.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStoreRequestLines.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.requestLines = action.payload;
      })
      .addCase(fetchStoreRequestLines.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to fetch store request lines";
      })
      .addCase(fetchStoreReqDropDowns.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStoreReqDropDowns.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.issuingStoreSetup = action.payload.issuingStoreSetup;
        state.itemsListSetup = action.payload.itemsListSetup;
      })
      .addCase(fetchStoreReqDropDowns.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to fetch store request dropdowns";
      })
      .addCase(submitStoreRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitStoreRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.response = action.payload;
      })
      .addCase(submitStoreRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to submit store request";
      })
     .addCase(submitStoreLineRequest.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitStoreLineRequest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.response = action.payload;
      })
      .addCase(submitStoreLineRequest.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to submit store request";
      })
  },
});



export const selectStoreRequisitions = (state: RootState) => ({
  storeRequests: state.storeRequests.storeRequests,
  status: state.storeRequests.status,
  error: state.storeRequests.error,
});

export const selectStoreRequest = (state: RootState) => ({
  requestHeader: state.storeRequests.requestHeader,
  requestLines: state.storeRequests.requestLines,
  status: state.storeRequests.status,
  error: state.storeRequests.error,
});

export const selectStoreReqDropDowns = (state: RootState) => ({
  status: state.storeRequests.status,
  error: state.storeRequests.error,
  issuingStoreSetup: state.storeRequests.issuingStoreSetup,
  itemCategorySetup: state.storeRequests.itemCategorySetup,
  itemsListSetup: state.storeRequests.itemsListSetup,
});

export const selectSubmitStoreRequest = (state: RootState) => ({
  status: state.storeRequests.status,
  message: state.storeRequests.message,
  error: state.storeRequests.error,
});

export const selectSubmitStoreLineRequest=(state:RootState)=>({
    status: state.storeRequests.status,
  message: state.storeRequests.message,
  error: state.storeRequests.error,
});

export const { resetState } = storeRequisitionSlice.actions;

export default storeRequisitionSlice.reducer;
