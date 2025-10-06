export interface AuthState {
  token: string | null;
  bcToken: string | null;
  staffNo: string | null;
  status: 'idle' | 'pending' | 'failed'; 
  error: string | null;
  message?: string | null;
  otpCode?: string | null;
  password?:string |null;
  changePassword: ChangePasswordState; 
}


export interface ChangePasswordState {
  status: 'idle' | 'pending' |  'failed';
  error: string | null;
  message: string | null;
  password: string | null;
  passwordConfirm: string | null;
}
