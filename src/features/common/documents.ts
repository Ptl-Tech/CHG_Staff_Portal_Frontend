import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { DocumentData, DowloadDocument, LeaveStatement } from "../../types/attachments";
import type { RootState } from "../../app/store";
import { getPersistedTokens } from "../../utils/token";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface DocumentState {
  documents: DocumentData[];
  downloadDoc: DowloadDocument | null;
  HRdownload: string | null;
  leaveStatement: LeaveStatement | null;
  hrDocs: any[];
  deleteDoc: DocumentData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  leaveStatement: null,
  downloadDoc: null,
  hrDocs: [],
  HRdownload: null,
  deleteDoc: null,
  status: "idle",
  error: null,
};

export const fetchDocuments = createAsyncThunk<
  DocumentData[],
  { tableId: number; docNo: string },
  { rejectValue: string }
>(
  "documents/fetchDocuments",
  async ({ tableId, docNo }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const response = await axios.get(
        `${API_ENDPOINT}/Common/document/all-docs?tableID=${tableId}&docNo=${docNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch documents"
      );
    }
  }
);

export const fetchHRDocuments = createAsyncThunk<
  any[],
  void,
  { rejectValue: string }
>(
  "documents/fetchHRDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();

      const response = await axios.get(`${API_ENDPOINT}/Common/document/hr-docs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "BC-Authorization": bcToken || "",
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch HR documents"
      );
    }
  }
);

export const downloadDocument = createAsyncThunk<
  DocumentData,
  DowloadDocument,
  { rejectValue: string }
>(
  "documents/downloadDocument",
  async (documentData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();

      const response = await axios.post(
        `${API_ENDPOINT}/Common/document/download`,
        documentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );

      return response.data.description;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download document"
      );
    }
  }
);

export const downloadHRDocument = createAsyncThunk<
  { baseImage: string },
  string, 
  { rejectValue: string }
>(
  "documents/downloadHRDocument",
  async (docNo, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();

      const response = await axios.post(
        `${API_ENDPOINT}/Common/document/hrDownload`,
        JSON.stringify(docNo),
        {
          headers: {
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );

      return { baseImage: response.data.baseImage };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to download HR document"
      );
    }
  }
);


export const deleteDocument = createAsyncThunk<
  DocumentData,
  DocumentData,
  { rejectValue: string }
>(
  "documents/deleteDocument",
  async (documentData, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();

      const response = await axios.delete(`${API_ENDPOINT}/Common/document/delete`, {
        params: documentData,
        headers: {
          Authorization: `Bearer ${token}`,
          "BC-Authorization": bcToken || "",
        },
      });

      return response.data.description;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete document"
      );
    }
  }
);

export const generateLeaveStatement = createAsyncThunk<
  LeaveStatement,
  { leaveType: string },
  { rejectValue: string }
>(
  "documents/generateLeaveStatement",
  async ({ leaveType }, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();

      const response = await axios.post(
        `${API_ENDPOINT}/Leave/leave-statement`,
        { leaveType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "BC-Authorization": bcToken || "",
          },
        }
      );

      return {
        baseImage: response.data.description,
        filename: `Leave_Statement_${leaveType}.pdf`,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to generate leave statement"
      );
    }
  }
);

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch documents";
      })

      .addCase(downloadDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(downloadDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.downloadDoc = action.payload;
      })
      .addCase(downloadDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to download document";
      })

      .addCase(deleteDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.deleteDoc = action.payload;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to delete document";
      })

      .addCase(generateLeaveStatement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(generateLeaveStatement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.leaveStatement = action.payload;
      })
      .addCase(generateLeaveStatement.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || "Failed to generate leave statement";
      })

      .addCase(fetchHRDocuments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHRDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.hrDocs = action.payload;
      })
      .addCase(fetchHRDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || "Failed to fetch HR documents";
      })

      .addCase(downloadHRDocument.pending, (state) => {
        state.status = "loading";
      })
      .addCase(downloadHRDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.HRdownload = action.payload.baseImage;
      })
      .addCase(downloadHRDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to download HR document";
      });
  },
});

export const selectDocumentsList = (state: RootState) => ({
  status: state.documents.status,
  error: state.documents.error,
  documents: state.documents.documents,
});

export const selectHRDocumentsList = (state: RootState) => ({
  status: state.documents.status,
  error: state.documents.error,
  documents: state.documents.hrDocs,
});

export const selectDownloadDocument = (state: RootState) => ({
  status: state.documents.status,
  error: state.documents.error,
  document: state.documents.downloadDoc,
});

export const selectHRDownloadDocument = (state: RootState) => ({
  status: state.documents.status,
  error: state.documents.error,
  Hrdocument: state.documents.HRdownload,
});

export const selectDeleteDocument = (state: RootState) => ({
  status: state.documents.status,
  error: state.documents.error,
  document: state.documents.deleteDoc,
});

export const selectLeaveStatement = (state: RootState) => ({
  status: state.documents.status,
  error: state.documents.error,
  leaveStatement: state.documents.leaveStatement,
});

export default documentsSlice.reducer;
