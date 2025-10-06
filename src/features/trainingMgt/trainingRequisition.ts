import type { StatusRequestResponse } from './../../types/dropdown';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPersistedTokens } from "../../utils/token";
import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface TrainingRequestState{
   loading: boolean;
  error: string | null;
  data: any[];
  documentDetails: any;
  linesDetails: any[];
  dropdowns: any | null;
  trainingAreas?: any[];
  response :StatusRequestResponse | null;
}

const initialState: TrainingRequestState = {
  loading: false,
  error: null,
  data: [],
  documentDetails: null,
  linesDetails: [],
  dropdowns: null,
  response: null,
};

export const fetchTrainingRequisitions= createAsyncThunk(
  "training/fetchTrainingRequisitions",
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(
        `${API_ENDPOINT}/Training/all-training-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error("Error fetching training requisitions:", error);
      return rejectWithValue(error.response?.data || "Error fetching data");
    }
  }
);

export const fetchTrainingDocumentDetails= createAsyncThunk(
  "training/fetchTrainingDocumentDetails",
  async (docNo: string, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(
        `${API_ENDPOINT}/Training/one-training-request?docNo=${docNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error("Error fetching training document details:", error);
      return rejectWithValue(error.response?.data || "Error fetching data");
    }
  }
);

export const fetchTrainingNeedsList=createAsyncThunk(
  "training/fetchTrainingNeedsList",
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(
        `${API_ENDPOINT}/Training/training-Needs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error("Error fetching training needs list:", error);
      return rejectWithValue(error.response?.data || "Error fetching data");
    }
  }
);

export const SubmitTrainingRequest=createAsyncThunk<
StatusRequestResponse,
  any,
  { rejectValue: { message: string } }
>
(
  "training/SubmitTrainingRequest",
  async (requestData: any, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/Training/training-request-create`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error("Error submitting training request:", error);
      return rejectWithValue(error.response?.data.error || "Error submitting data");
    }
  }
);

export const submitAdhocLines = createAsyncThunk<
  { reponse: StatusRequestResponse },
  any[],
  { rejectValue: { message: string } }
>("training/submitAdhocLines", async (payloadData, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();

    const { data } = await axios.post(`${API_ENDPOINT}/Training/add-adhoc-lines`, payloadData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "BC-Authorization": bcToken || "",
        }
      });
    return data;
  } catch (error: any) {
    console.error("Error submitting adhoc lines:", error);
    return rejectWithValue(error.response?.data.error || "Error submitting data");

  }

});


//slice
const trainingRequisitionSlice = createSlice({
  name: "trainingRequisition",
  initialState,
  reducers: {resetState: () => initialState},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainingRequisitions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingRequisitions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload.allTrainingRequests;
      })
      .addCase(fetchTrainingRequisitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTrainingDocumentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingDocumentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.documentDetails = action.payload.trainingData ?? null;
        state.linesDetails = action.payload.adhocTrainingLines ?? [];
        state.dropdowns = action.payload.allTrainingNeeds;
                state.trainingAreas = action.payload.allTrainingAreas;
      })
      .addCase(fetchTrainingDocumentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTrainingNeedsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingNeedsList.fulfilled, (state, action) => {   
        state.loading = false;
        state.error = null;
        state.dropdowns = action.payload;
      })
      .addCase(fetchTrainingNeedsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(SubmitTrainingRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SubmitTrainingRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.response =action.payload;
      })
      .addCase(SubmitTrainingRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitAdhocLines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAdhocLines.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.response = action.payload.reponse;
      })
      .addCase(submitAdhocLines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export const { resetState } = trainingRequisitionSlice.actions;
export default trainingRequisitionSlice.reducer;