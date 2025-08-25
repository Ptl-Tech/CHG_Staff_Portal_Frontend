export interface TravelRequest {
    documentNo: string;
    requestDate: Date;
    donorCode: string;
    projectCode: string;
    deptTime: string;
    returnTime: string;
    requestor?: string;
    etd: string;
    etr: string;
    travelDestination: string;
    tripAuthorizor: string;
    visitPurpose?: string
    hotelCost?: string | null;
    mealCost?: string | null;
    flightCost:string|null;
    visafee:string|null;
    airportFees?: string | null;
    perDiemRate?: number | null;
    transportMode?: number | null;
    perDiemAmount?: number | null;
    days: number;
    status:string|null;

}