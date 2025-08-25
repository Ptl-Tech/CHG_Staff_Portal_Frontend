export interface VehicleRequest {
    documentNo:string;
    requestDate: Date;
    requestor?: string;
    deptTime: string;
    returnTime: string;
    travelDestination: string;
    tripAuthorizor: string;
    visitPurpose?: string
     vehicleNumber?:string|null;
    regNo?:string|null;
    carType?:string|null;
    status:string
}

