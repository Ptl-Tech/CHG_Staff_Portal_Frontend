import React from 'react'
import { Route } from 'react-router-dom'
import MasterLayout from '../layout/MasterLayout'
import Dashboard from '../Modules/Dashboard/Dashboard'
import LeaveApplications from '../Modules/HrModule/LeaveMgt/pages/LeaveApplications'
import LeaveApplicationForm from '../Modules/HrModule/LeaveMgt/pages/LeaveApplicationForm'
import LeaveDocumentView from '../Modules/HrModule/LeaveMgt/pages/LeaveDocumentView'
import PurchaseRequisitions from '../Modules/PurchaseRequisitions/pages/PurchaseRequisitions'
import PurchaseRequisitionForm from '../Modules/PurchaseRequisitions/pages/PurchaseRequisitionForm'
import PurchaseDocumentView from '../Modules/PurchaseRequisitions/pages/PurchaseDocumentView'
import VehicleRequisitions from '../Modules/LogisticsModule/VehicleRequests/pages/VehicleRequisitions'
import VehicleRequestForm from '../Modules/LogisticsModule/VehicleRequests/pages/VehicleRequestForm'
import TravelRequests from '../Modules/LogisticsModule/TravelRequisition/pages/TravelRequests'
import TravelRequisitionForm from '../Modules/LogisticsModule/TravelRequisition/pages/TravelRequisitionForm'
import TravelRequestDocView from '../Modules/LogisticsModule/TravelRequisition/pages/TravelRequestDocView'
import TravelAdvanceList from '../Modules/Finance/TravelAdvance/pages/TravelAdvanceList'
import TravelAdvanceSurrenderList from '../Modules/Finance/TravelAdvanceSurrender/pages/TravelAdvanceSurrenderList'
import StaffClaimlist from '../Modules/Finance/StaffClaim/pages/StaffClaimlist'
import StaffClaimForm from '../Modules/Finance/StaffClaim/pages/StaffClaimForm'
import TravelAdvanceSurrenderForm from '../Modules/Finance/TravelAdvanceSurrender/pages/TravelAdvanceSurrenderForm'
import TravelAdvanceRequisition from '../Modules/Finance/TravelAdvance/pages/TravelAdvanceRequisition'
import ChangePassword from '../auth/ChangePassword'
import EmployeePayroll from '../Modules/PayRoll/EmployeePayroll'
import StoreRequisitions from '../Modules/StoreRequests/StoreRequisitions'
import StoreRequisitionForm from '../Modules/StoreRequests/StoreRequisitionForm'
import LeaveStatement from '../Modules/HrModule/LeaveMgt/pages/LeaveStatement'
import GeneratePayroll from '../Modules/PayRoll/GeneratePayroll'

const MainRoutes = () => (
    <>
        <Route path="/" element={<MasterLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="Leave Application/Apply-Leave" element={<LeaveApplicationForm />} />
            <Route path="Leave Application/Leave-List" element={<LeaveApplications />} />
            <Route path="Leave Application/Leave-Document" element={<LeaveDocumentView />} />
            <Route path="Leave Application/leave-Statement" element={<LeaveStatement />} />

            <Route path="payroll/Payslip" element={<GeneratePayroll />} />
            <Route path="procurement/store-requisition" element={<StoreRequisitions />} />
            <Route path="procurement/Store-Document" element={<StoreRequisitionForm />} />
            <Route path="procurement/purchase-requisition" element={<PurchaseRequisitions />} />
            <Route path="procurement/New-Purchase-Requisition" element={<PurchaseRequisitionForm />} />
            <Route path="procurement/Purchase-Document" element={<PurchaseDocumentView />} />
            <Route path="logistics/Vehicle-Requests" element={<VehicleRequisitions />} />
            <Route path="logistics/Vehicle-Requisition" element={<VehicleRequestForm />} />
            <Route path="logistics/Travel-Requisition" element={<TravelRequests />} />
            <Route path="logistics/New-Travel-Requisition" element={<TravelRequisitionForm />} />
            <Route path="logistics/Travel-Requisition-Document" element={<TravelRequestDocView />} />
            <Route path="finance/Travel-advance-list" element={<TravelAdvanceList />} />
            <Route path="finance/Advance-surrender-list" element={<TravelAdvanceSurrenderList />} />
            <Route path="finance/Staff-Claim-list" element={<StaffClaimlist />} />
            <Route path="finance/New-Staff-Claim" element={<StaffClaimForm />} />
            <Route path="finance/Travel-Advance-Surrender" element={<TravelAdvanceSurrenderForm />} />
            <Route path="finance/Travel-Advance" element={<TravelAdvanceRequisition />} />
            <Route path="settings/change-password" element={<ChangePassword />} />

        </Route>

    </>
)

export default MainRoutes
