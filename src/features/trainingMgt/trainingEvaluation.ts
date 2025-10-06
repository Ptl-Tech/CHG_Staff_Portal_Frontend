import type { StatusRequestResponse } from './../../types/dropdown';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPersistedTokens } from "../../utils/token";
import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface TrainingEvalutionState{
   loading: boolean;
  error: string | null;
  data: any[];
  documentDetails: any;
  linesDetails: any[];
  dropdowns: any | null;
  trainingAreas?: any[];
  response :StatusRequestResponse | null;
}

const initialState: TrainingEvalutionState = {
  loading: false,
  error: null,
  data: [],
  documentDetails: null,
  linesDetails: [],
  dropdowns: null,
  response: null,
};

export const fetchTrainingEvaluation=createAsyncThunk(
  "trainingEvaluation/fetchTrainingEvaluation",
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(
        `${API_ENDPOINT}/Training/all-training-evaluations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error("Error fetching training Evaluations:", error);
      return rejectWithValue(error.response?.data || "Error fetching data");
    }
  }
);

export const fetchEvaluationDocumentDetails= createAsyncThunk(
  "trainingEvaluation/fetchEvaluationDocumentDetails",
  async (docNo: string, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(
        `${API_ENDPOINT}/Training/one-training-evaluation?docNo=${docNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );
      return data;
    } catch (error: any) {
      console.error("Error fetching training Evaluation details:", error);
      return rejectWithValue(error.response?.data || "Error fetching data");
    }
  }
);

export const InitiateTrainingEvaluation=createAsyncThunk<
StatusRequestResponse,
  any,
  { rejectValue: { message: string } }
>
(
  "trainingEvaluation/InitiateTrainingEvaluation",
  async (requestData: any, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/Training/training-evaluation-create`,
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

export const SubmitTrainingEvaluation=createAsyncThunk<
StatusRequestResponse,
  any,
  { rejectValue: { message: string } }
>
(
  "trainingEvaluation/SubmitTrainingEvaluation",
  async (requestData: any, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.post(
        `${API_ENDPOINT}/Training/training-evaluation-submit`,
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



const trainingEvaluationSlice = createSlice({
  name: "trainingEvaluation",
  initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrainingEvaluation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrainingEvaluation.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = null;
                state.data = payload.allTrainingEvaluations;
                state.dropdowns = payload.allTrainingNos || null;
            })
            .addCase(fetchTrainingEvaluation.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message ?? "Failed to fetch training Evaluations";
            })
            .addCase(fetchEvaluationDocumentDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvaluationDocumentDetails.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = null;
                state.documentDetails = payload.trainingEvaluation;
                state.linesDetails = payload.linesDetails || [];
            })
            .addCase(fetchEvaluationDocumentDetails.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message ?? "Failed to fetch training Evaluation details";
            })

            .addCase(InitiateTrainingEvaluation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.response = null;
            })
            .addCase(InitiateTrainingEvaluation.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = null;
                state.response = payload;
            }
            )
            .addCase(InitiateTrainingEvaluation.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message ?? "Failed to submit training Evaluation";
                state.response = null;
            })
            .addCase(SubmitTrainingEvaluation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.response = null;
            })
            .addCase(SubmitTrainingEvaluation.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.error = null;
                state.response = payload;
            }
            )
            .addCase(SubmitTrainingEvaluation.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.message ?? "Failed to submit training Evaluation";
                state.response = null;
            }); 

    },
  });
  
  export default trainingEvaluationSlice.reducer;