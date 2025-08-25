export interface PaymentData {
  paymentNo: string;
  dateRequested: string;
  paymentType: string;
  paymentNarration: string;
  destination: string;
  staffNo: string;
  travelDate: string;
  completionDate: string;
  isPosted: boolean;
  imprestIssueDocNo: string;
  amountSpent: number;
  surrenderDate: string;
  claimRaised: boolean;
  status: string;
  totalAmount: number;
  claimType: string;
  imprestSurrenderNo: string;
  noOfDays: number;
  travelType: string;
  imprestAmount: number;
  paymentRequestType: string;
  paymentRequestDocNo: string;
  paymentRequestAmount: string;
  listOfProjects: Jobs[];
  listOfDepartments: DimensionValues[];
  listOfExpenditureTypes: ExpenditureTypes[];
  listOfActivities: JobPlanningLines[];
  listOfProjectCodes: DimensionValues[];
  //   listOfClaimLineTypes: CommonModel[];

  //   listOfPaymentRequestNos: PaymentLineNos[];


}

export interface Destination {
  destinationCode: string;
  destinationName: string;
  travelType: string;

}

export interface ImprestSurrenderLineData {
  lineNo: number;
  documentNo: string;
  accountNo: string;
  lineAmount: string;
  actualSpent: number;
  additionalComments: string;

}

export interface Jobs {
  jobNo: string;
  jobDescription: string;

}
export interface PaymentLineNos {
  requestLineNo: string;
  amount: number;
  description: string;

}
export interface DimensionValues {
  code: string;
  name: string
}

export interface ExpenditureTypes {
  code: string;
  description: string
}
export interface JobPlanningLines {
  lineNo: string;
  planningLineDescription: string;
  isTravelLine: boolean;
  jobNo: string;
  budgetAmount: number;

}

export interface ClaimLineData {
  lineNo: number;
  documentNo: string;
  expenditureType: string;
  lineDescription: string;
  lineAmount: number;
  donorCode: string;
  projectCode: string;
  projectNo: string;
  projectTaskNo: string;
  expenditureDate: string;


}

export interface PaymentLinesData {
  lineNo: number;
  documentNo: string;
  expenditureType: string;
  accountNo: string;
  accountName: string;
  lineDescription: string;
  lineAmount: number;
  actualSpent: number;
  additionalComments: string;
  project: string;
  projectName: string;
  activity: string;
  projectCode: string;
  taskName: string;
  department: string;
  dailyExpense: number;
  noOfDays: number;
  donorCode: string;
  expenditureDate: string;
  lineRemarks: string;
  taskNo: string
}



export interface ImprestLineData {
  lineNo: number;
  documentNo: string;
  expenditureType: string;
  project: string;
  projectActivity: string;
  department: string;
  dailyRate: number;
  noOfDays: number;
  lineAmount: number;
  projectCode: string;
  donorCode: string;
}

export interface ImprestDocuments {
  code: string;
  description: string;

}

export interface StaffClaimDTO {
  paymentNo: string | null;
  claimType: number;
  paymentNarration: string | null;
  imprestSurrenderNo: string|null;
}