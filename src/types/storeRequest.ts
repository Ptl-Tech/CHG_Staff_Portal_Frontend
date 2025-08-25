export interface StoreRequisition {
  reqNo: string;
  staffNo: string;
  employeeName: string;
  requestType:string;
  requestDate: string;
  requiredDate: string;
  issueDate?: string;
  issuingStore: string;
  status:string;
  responsibilityCenter:string;
  uoM:string;
  quantity:number;
  approvedQuantity:number;
  plannedQuantity:number;
  unitCost:number;
  lineAmount:number;  
  budgetCost:number;  
  item:string;
  //committed: boolean;
}
