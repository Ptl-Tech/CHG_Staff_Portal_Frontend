import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";
import { getPersistedTokens } from "../../utils/token";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export interface LoginState {
  token: string|null;
  bcToken: string|null;
  staffNo: string|null;
  password: string|null;
  status: "idle" | "pending" | "failed";
  error: string | null;
  message: string | null;
}

export interface ForgetPasswordState {
  staffNo: string | null;
  status: "idle" | "pending" | "failed";
  error: string | null;
  message: string | null;
}

export interface ResetPasswordState {
  staffNo: string | null;
  randomKey: number | null;
  password: string | null;
  status: "idle" | "pending" | "failed";
  error: string | null;
  message: string | null;
}

export interface ChangePasswordState {
  password: string | null;
  status: "idle" | "pending" | "failed";
  error: string | null;
  message: string | null;
}
//combined authstates
export interface AuthState {
  login: LoginState;
  forgetPassword: ForgetPasswordState;
  resetPassword: ResetPasswordState;
  changePassword: ChangePasswordState;
}


const initialState: AuthState = {
  login: {
    token: null,
    bcToken: null,
    staffNo: null,
    password: null,
    status: "idle",
    error: null,
    message: null,
  },
  forgetPassword: {
    staffNo: null,
    status: "idle",
    error: null,
    message: null,
  },
  resetPassword: {
    staffNo: null,
    randomKey: null,
    password: null,
    status: "idle",
    error: null,
    message: null,
  },
  changePassword: {
    password: null,
    status: "idle",
    error: null,
    message: null,
  },
};


export const loginUser = createAsyncThunk<
  { token: string; bcToken: string; staffNo: string; message: string },
  { staffNo: string; password: string },
  { rejectValue: { message: string } }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API_ENDPOINT}/Account/login`, credentials);

if(data.status !== 'ACTIVE'){
  return rejectWithValue({
    message: data.message,
  });
}


    return data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.message || "Failed to login",
    });
  }
});

export const forgetPassword = createAsyncThunk<
  { status: number; message: string },
  { StaffNo: string },
  { rejectValue: { message: string } }
>("auth/forgetPassword", async ({ StaffNo }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      `${API_ENDPOINT}/Account/forgot-password?staffNo=${StaffNo}`
    );
    return {
      status: data.responseDTO.statusCode,
      message: data.responseDTO.description,
    };
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.error || "Failed to forget password",
    });
  }
});

export const resetPassword = createAsyncThunk<
  { status: number; message: string },
  { staffNo: string | null; randomKey: string | null; newPassword: string },
  { rejectValue: { message: string } }
>("auth/resetPassword", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      `${API_ENDPOINT}/Account/complete-forgot-password`,
      credentials
    );
    return {
      status: data.responseDTO.statusCode,
      message: data.responseDTO.description,
    };
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.error || "Reset Password failed",
    });
  }
});

export const changePassword = createAsyncThunk<
  { status: number; message: string },
  { password: string },
  { rejectValue: { message: string } }
>("auth/changePassword", async (values, { rejectWithValue }) => {
  try {
    const { token, bcToken } = getPersistedTokens();
    const { data } = await axios.post(
      `${API_ENDPOINT}/Account/change-password?newPassword=${values.password}`,
      values,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "BC-Authorization": bcToken || "",
        },
      }
    );
    return {
      status: data.status,
      message: data.description,
    };
  } catch (err: any) {
    return rejectWithValue({
      message: err?.response?.data?.error || "Change Password failed",
    });
  }
});


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.clear();
      localStorage.removeItem("persist:auth");

      state.login = initialState.login;
    },
    resetLogin:(s)=>{
      s.login.token = null;
      s.login.bcToken = null;
      s.login.staffNo = null;
      s.login.password = null;
      s.login.status = "idle";
      s.login.error = null;
      s.login.message = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => {
        s.login.status = "pending";
        s.login.error = null;
      })
      .addCase(loginUser.fulfilled, (s, { payload }) => {
        s.login.status = "idle";
        s.login.token = payload.token;
        s.login.bcToken = payload.bcToken;
        s.login.staffNo = payload.staffNo;
        s.login.message = payload.message;
      })
      .addCase(loginUser.rejected, (s, { payload }) => {
        s.login.status = "failed";
        s.login.error = payload?.message ?? "Unknown error";
      });

      

    // Forget password
    builder
      .addCase(forgetPassword.pending, (s) => {
        s.forgetPassword.status = "pending";
        s.forgetPassword.error = null;
      })
      .addCase(forgetPassword.fulfilled, (s, { payload }) => {
        s.forgetPassword.status = "idle";
        s.forgetPassword.message = payload.message;
      })
      .addCase(forgetPassword.rejected, (s, { payload }) => {
        s.forgetPassword.status = "failed";
        s.forgetPassword.error = payload?.message ?? "Unknown error";
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (s) => {
        s.resetPassword.status = "pending";
        s.resetPassword.error = null;
      })
      .addCase(resetPassword.fulfilled, (s, { payload }) => {
        s.resetPassword.status = "idle";
        s.resetPassword.message = payload.message;
      })
      .addCase(resetPassword.rejected, (s, { payload }) => {
        s.resetPassword.status = "failed";
        s.resetPassword.error = payload?.message ?? "Unknown error";
      });

    // Change password
    builder
      .addCase(changePassword.pending, (s) => {
        s.changePassword.status = "pending";
        s.changePassword.error = null;
      })
      .addCase(changePassword.fulfilled, (s, { payload }) => {
        s.changePassword.status = "idle";
        s.changePassword.message = payload.message;
      })
      .addCase(changePassword.rejected, (s, { payload }) => {
        s.changePassword.status = "failed";
        s.changePassword.error = payload?.message ?? "Unknown error";
      });
  },
});


export const selectAuth = (state:any)=> ({
  token: state.auth.login.token,
  bcToken: state.auth.login.bcToken,
  staffNo: state.auth.login.staffNo,
  isAuthenticated: !!state.auth.login.token,
  status: state.auth.login.status,
  error: state.auth.login.error,
  message: state.auth.login.message,
  
})   

export const selectForgetPassword = (state: any) =>
  state.auth.forgetPassword;

export const selectResetPassword = (state: any) =>
  state.auth.resetPassword;

export const selectChangePassword = (state: any) =>
  state.auth.changePassword;

export const { logout, resetLogin} = authSlice.actions;
export default authSlice.reducer;
