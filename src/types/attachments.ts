export interface DocumentData {
  fileID?: number | null,
  fileName?: string | null,
  fileExtension?: string | null,
  docNo: string;
    tableID: number,

}


export interface LeaveStatement{

  base64String: string;
}

export interface DowloadDocument {
  tableId: number,
  docNo: string,
  fileID?: number | null,
  fileName?: string | null,
  fileExtension?: string | null,

}
