// types/dropdown.ts
export interface DropdownOptions {
  code: string | null;
  description: string | null;
}

export interface ItemsOptions {
  code: string | null;
  description: string | null;
  unitMeasure: string | null;
  unitPrice: number | null;
  inventoryCount: number | null;
}


export interface JobsOptions {
  jobNo: string | null;
  jobDescription: string | null;
}

export interface StatusRequestResponse {
  description: string;
  statusCode: number;
  status: string;
}
export type AlertInfo = {
  message: string;
  type: "success" | "info" | "warning" | "error";
} | null;