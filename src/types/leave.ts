export interface LeaveApplication {
  leaveNo: string;
  staffNo: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  returnDate?: string;
  days?: number;
  leaveDays?: number;
  reliever?:string;
  leaveType:string;
    status?:string;
  responsibilityCenter?:string;
  remarks: string;
  message?: string;
}
