import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";
import type { DropdownOptions, JobsOptions } from "../../types/dropdown";
import { getPersistedTokens } from "../../utils/token";
import type { RootState } from '../../app/store';
import type { ApprovalEntries } from '../../components/ApprovalTrailModal';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface SetupState {
  uomSetup: DropdownOptions[];
  staffList: DropdownOptions[];
  donorsList: DropdownOptions[];
  responsibilityCenters:DropdownOptions[];
  jobsList:JobsOptions[];
  approvalEntries:ApprovalEntries[];
  status: 'idle' | 'pending' | 'failed';
  error: string | null;
}

const initialState: SetupState = {
  uomSetup: [],
  staffList: [],
  donorsList: [],
  responsibilityCenters:[],
  jobsList:[],
  approvalEntries:[],
  status: 'idle',
  error: null,
};

// Fetch UoM
export const fetchUoMSetup = createAsyncThunk<
  DropdownOptions[],
  void,
  { rejectValue: { message: string } }
>('common/fetchUoMSetup', async (_, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const { data } = await axios.get(`${API_ENDPOINT}/Common/UoM-Setup`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });
    return data;
  } catch (err: any) {
    return rejectWithValue({ message: err.message || 'UoM fetch failed' });
  }
});

// responsibilityCenters
export const fetchResponsibilityCenters = createAsyncThunk<
  DropdownOptions[],
  void,
  { rejectValue: { message: string } }
>('common/fetchResponsibilityCenters', async (_, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const { data } = await axios.get(`${API_ENDPOINT}/Common/Responsibility-Centers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });
    return data;
  } catch (err: any) {
    return rejectWithValue({ message: err.message || 'Responsibility Centers fetch failed' });
  }
});

export const fetchdocApprovalentries = createAsyncThunk<
  ApprovalEntries[],
  string, // docNo will be passed as a string
  { rejectValue: { message: string } }
>(
  'common/fetchdocApprovalentries',
  async (docNo, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(
        `${API_ENDPOINT}/Common/approvalTrail/document-trail?docNo=${docNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'BC-Authorization': bcToken || '',
          },
        }
      );
      console.log("approvalEntries",data);
      return data;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err.message ||
          'Failed to fetch document Approval. Please try again after sometime.',
      });
    }
  }
);


// Fetch Staff List
export const fetchEmployeeList = createAsyncThunk<
  DropdownOptions[],
  void,
  { rejectValue: { message: string } }
>('common/fetchEmployeeList', async (_, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const { data } = await axios.get(`${API_ENDPOINT}/Common/staff-list`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'BC-Authorization': bcToken || '',
      },
    });
    return data;
  } catch (err: any) {
    return rejectWithValue({ message: err.message || 'Employee list fetch failed' });
  }
});

// Fetch Donors List
export const fetchDonorsList = createAsyncThunk<
  DropdownOptions[], // ✅ Return type
  void,              // ✅ Argument type
  { rejectValue: { message: string } } // ✅ Error shape
>(
  'common/fetchDonorsList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Common/donors-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || 'Donors list fetch failed' });
    }
  }
);

export const fetchJobsList = createAsyncThunk<
  JobsOptions[], // ✅ Return type
  void,              // ✅ Argument type
  { rejectValue: { message: string } } // ✅ Error shape
>(
  'common/fetchJobsList',
  async (_, { rejectWithValue }) => {
    try {
      const { token, bcToken } = getPersistedTokens();
      const { data } = await axios.get(`${API_ENDPOINT}/Common/projects-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'BC-Authorization': bcToken || '',
        },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue({ message: err.message || 'Project list fetch failed' });
    }
  }
);


// Slice
const commonSetupSlice = createSlice({
  name: 'commonSetup',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // UoM
    builder.addCase(fetchUoMSetup.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    });
    builder.addCase(fetchUoMSetup.fulfilled, (state, { payload }) => {
      state.status = 'idle';
      state.uomSetup = payload;
    });
    builder.addCase(fetchUoMSetup.rejected, (state, { payload }) => {
      state.status = 'failed';
      state.error = payload?.message ?? 'Unknown error';
    });

    // Staff
    builder.addCase(fetchEmployeeList.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    });
    builder.addCase(fetchEmployeeList.fulfilled, (state, { payload }) => {
      state.status = 'idle';
      state.staffList = payload;
    });
    builder.addCase(fetchEmployeeList.rejected, (state, { payload }) => {
      state.status = 'failed';
      state.error = payload?.message ?? 'Unknown error';
    })
    .addCase(fetchResponsibilityCenters.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    })
    .addCase(fetchResponsibilityCenters.fulfilled, (state, { payload }) => {
      state.status = 'idle';
      state.responsibilityCenters = payload;
    })
    .addCase(fetchResponsibilityCenters.rejected, (state, { payload }) => {
      state.status = 'failed';
      state.error = payload?.message ?? 'Unknown error';
    });

    // Donors
    builder.addCase(fetchDonorsList.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    });
    builder.addCase(fetchDonorsList.fulfilled, (state, { payload }) => {
      state.status = 'idle';
      state.donorsList = payload;
    });
    builder.addCase(fetchDonorsList.rejected, (state, { payload }) => {
      state.status = 'failed';
      state.error = payload?.message ?? 'Unknown error';
    })
    .addCase(fetchJobsList.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    })
    .addCase(fetchJobsList.fulfilled, (state, { payload }) => {
      state.status = 'idle';
      state.jobsList = payload;
    })
    .addCase(fetchJobsList.rejected, (state, { payload }) => {
      state.status = 'failed';
      state.error = payload?.message ?? 'Unknown error';
    }).addCase(fetchdocApprovalentries.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    })
    .addCase(fetchdocApprovalentries.fulfilled, (state, { payload }) => {
      state.status = 'idle';
      state.approvalEntries = payload;
    })
    .addCase(fetchdocApprovalentries.rejected, (state, { payload }) => {
      state.status = 'failed';
      state.error = payload?.message ?? 'Unknown error';
    })
  },
});

// Selectors
export const selectCommonSetupsData = (state: RootState) => state.commonSetup;
export const selectUomSetup = (state: RootState) => state.commonSetup.uomSetup;
export const selectStaffList = (state: RootState) => state.commonSetup.staffList;
export const selectDonorsList = (state: RootState) => state.commonSetup.donorsList;
export const selectJobsList = (state: RootState) => state.commonSetup.jobsList;
export const selectResponsibilityCenters = (state: RootState) => state.commonSetup.responsibilityCenters;
export const selectDocumentApprovalEntries = (state: RootState) => ({
  status: state.commonSetup.status,
  error: state.commonSetup.error,
  approvalEntries: state.commonSetup.approvalEntries
})
export const selectCommonSetupStatus = (state: RootState) => state.commonSetup.status;


export default commonSetupSlice.reducer;
