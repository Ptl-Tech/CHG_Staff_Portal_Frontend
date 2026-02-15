import { Route } from "react-router-dom";
import ChangePassword from "../auth/ChangePassword";
import MasterLayout from "../layout/MasterLayout";
import ApprovalsList from "../Modules/ApprovalMgt/ApprovalsList";
import Dashboard from "../Modules/Dashboard/Dashboard";
import DepartmentalEmployees from "../Modules/Dashboard/Partials/DepartmentalEmployees";
import EmployeesonLeave from "../Modules/Dashboard/Partials/EmployeesonLeave";
import HRDocuments from "../Modules/Documents/HRDocuments";
import StaffClaimForm from "../Modules/Finance/StaffClaim/pages/StaffClaimForm";
import StaffClaimlist from "../Modules/Finance/StaffClaim/pages/StaffClaimlist";
import TravelAdvanceList from "../Modules/Finance/TravelAdvance/pages/TravelAdvanceList";
import TravelAdvanceRequisition from "../Modules/Finance/TravelAdvance/pages/TravelAdvanceRequisition";
import TravelAdvanceSurrenderForm from "../Modules/Finance/TravelAdvanceSurrender/pages/TravelAdvanceSurrenderForm";
import TravelAdvanceSurrenderList from "../Modules/Finance/TravelAdvanceSurrender/pages/TravelAdvanceSurrenderList";
import LeaveApplicationForm from "../Modules/HrModule/LeaveMgt/pages/LeaveApplicationForm";
import LeaveApplications from "../Modules/HrModule/LeaveMgt/pages/LeaveApplications";
import LeaveDocumentView from "../Modules/HrModule/LeaveMgt/pages/LeaveDocumentView";
import LeaveStatement from "../Modules/HrModule/LeaveMgt/pages/LeaveStatement";
import DocumentView from "../Modules/HrModule/TrainingManagement/pages/DocumentView";
import TrainingRequisition from "../Modules/HrModule/TrainingManagement/pages/TrainingRequisition";
import TravelRequestDocView from "../Modules/LogisticsModule/TravelRequisition/pages/TravelRequestDocView";
import TravelRequests from "../Modules/LogisticsModule/TravelRequisition/pages/TravelRequests";
import TravelRequisitionForm from "../Modules/LogisticsModule/TravelRequisition/pages/TravelRequisitionForm";
import GenerateP9 from "../Modules/PayRoll/GenerateP9";
import GeneratePayroll from "../Modules/PayRoll/GeneratePayroll";
import PurchaseDocumentView from "../Modules/PurchaseRequisitions/pages/PurchaseDocumentView";
import PurchaseRequisitionForm from "../Modules/PurchaseRequisitions/pages/PurchaseRequisitionForm";
import PurchaseRequisitions from "../Modules/PurchaseRequisitions/pages/PurchaseRequisitions";
import StoreRequisitionForm from "../Modules/StoreRequests/StoreRequisitionForm";
import StoreRequisitions from "../Modules/StoreRequests/StoreRequisitions";
import LeaveList from "../Modules/ApprovalMgt/LeaveList";

const MainRoutes = () => (
  <>
    <Route path="/" element={<MasterLayout />}>
      <Route index element={<Dashboard />} />
      <Route
        path="Leave Application/Apply-Leave"
        element={<LeaveApplicationForm />}
      />
      <Route
        path="Leave Application/Leave-List"
        element={<LeaveApplications />}
      />
      <Route
        path="Leave Application/Leave-Document"
        element={<LeaveDocumentView />}
      />
      <Route
        path="Leave Application/leave-Statement"
        element={<LeaveStatement />}
      />
      <Route
        path="Training-Management/Training-Requsitions"
        element={<TrainingRequisition />}
      />
      <Route
        path="Training-Management/Document-View"
        element={<DocumentView />}
      />
      <Route path="HR-documents" element={<HRDocuments />} />
      <Route path="payroll/Payslip" element={<GeneratePayroll />} />
      <Route path="payroll/P9" element={<GenerateP9 />} />

      <Route
        path="procurement/store-requisition"
        element={<StoreRequisitions />}
      />
      <Route
        path="procurement/Store-Document"
        element={<StoreRequisitionForm />}
      />
      <Route
        path="procurement/purchase-requisition"
        element={<PurchaseRequisitions />}
      />
      <Route
        path="procurement/New-Purchase-Requisition"
        element={<PurchaseRequisitionForm />}
      />
      <Route
        path="procurement/Purchase-Document"
        element={<PurchaseDocumentView />}
      />

      <Route path="supervisor/leave" element={<EmployeesonLeave />} />
      <Route path="supervisor/employees" element={<DepartmentalEmployees />} />
      <Route path="logistics/Travel-Requisition" element={<TravelRequests />} />
      <Route
        path="logistics/New-Travel-Requisition"
        element={<TravelRequisitionForm />}
      />
      <Route
        path="logistics/Travel-Requisition-Document"
        element={<TravelRequestDocView />}
      />
      <Route
        path="finance/Travel-advance-list"
        element={<TravelAdvanceList />}
      />
      <Route
        path="finance/Advance-surrender-list"
        element={<TravelAdvanceSurrenderList />}
      />
      <Route path="finance/Staff-Claim-list" element={<StaffClaimlist />} />
      <Route path="finance/New-Staff-Claim" element={<StaffClaimForm />} />
      <Route
        path="finance/Travel-Advance-Surrender"
        element={<TravelAdvanceSurrenderForm />}
      />
      <Route
        path="finance/Travel-Advance"
        element={<TravelAdvanceRequisition />}
      />
      <Route path="/Leave-Management/Pending" element={<LeaveList />} />
      <Route path="Approval-Management/Pending" element={<ApprovalsList />} />
      <Route path="settings/change-password" element={<ChangePassword />} />
    </Route>
  </>
);

export default MainRoutes;
