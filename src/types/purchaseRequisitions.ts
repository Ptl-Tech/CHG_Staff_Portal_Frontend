export interface PurchaseHeader {
    documentNo: string,
    orderDate: Date,
    reasonDescription: string,
    status: string,
    procurementPlan: string,
    totalAmount?: number
}

export interface ProcurementPlans {
    code: string;
    description: string;
}

export interface PurchaseLineItem {
        documentNo:string;
    lineNo:number;
    procurementItem:string;
    specification:string;
    itemNo: string;
    planYear: string;
    requiredDate: Date;
    activityBudget: number;
    spentBudget: number;
    procurementItemDescription: string;
    //  projectNo: string;
    uom: string;
    unitPrice: number;
    quantity: number;
    amount: number;
}

export interface PurchasePlanItemsList {
    itemNo: string;
    itemDescription: string;
    planYear: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    activityBudget: number;
    spentBudget: number;
}

export interface PurchaseRequisition {
    header: PurchaseHeader;
    procurementPlanItems: PurchasePlanItemsList[];
}