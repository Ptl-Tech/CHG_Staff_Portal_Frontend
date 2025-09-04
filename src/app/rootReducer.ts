import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth';
import { fetchLeaveDocumentReducer, leaveApplicationReducer, leaveDropdownsReducer, leaveListReducer, returnDatesReducer } from '../features/leaveApplication';
import { ApprovalReducer, CancelApprovalReducer, CommonSetupsReducer, DeleteLineReducer, DocumentsReducer } from '../features/common';
import { PurchasePlansSetupReducer, PurchaseRequisitionReducer } from '../features/purchaseRequisitions';
import { VehicleRequestReducer } from '../features/vehicleRequests';
import { TravelRequestReducer } from '../features/TravelRequest';
import { AdvanceRequisitionsReducer, AdvanceSurrenderReducer, PaymentRequestReducer, StaffClaimReducer } from '../features/finance';
import { DashboardReducer } from '../features/dashboard';
import { StoreRequisitionReducer } from '../features/storeRequisitions';
import { PayrollServiceReducer } from '../features/payRoll';

export const rootReducer = combineReducers({
    auth: authReducer,
    leaveList: leaveListReducer,
    leaveDropdowns: leaveDropdownsReducer,
    returnDates: returnDatesReducer,
    leaveDocument: fetchLeaveDocumentReducer,
    leaveApplication: leaveApplicationReducer,
    approval: ApprovalReducer,
    cancelApproval: CancelApprovalReducer,
    purchaseRequests: PurchaseRequisitionReducer,
    procurementPlans: PurchasePlansSetupReducer,
    commonSetup: CommonSetupsReducer,
    vehicleRequests: VehicleRequestReducer,
    travelRequests: TravelRequestReducer,
    advanceRequests: AdvanceRequisitionsReducer,
    advanceSurrender: AdvanceSurrenderReducer,
    staffClaim: StaffClaimReducer,
    paymentsRequest: PaymentRequestReducer,
    storeRequests:StoreRequisitionReducer,
    dashboard: DashboardReducer,
    documents:DocumentsReducer,
    delete:DeleteLineReducer,
    payroll:PayrollServiceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;