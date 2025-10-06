import { Modal, Descriptions, Spin, Alert, Button } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/ReduxHooks";
import {
  fetchLeaveDocument,
  selectLeaveDocument,
} from "../../../features/leaveApplication/fetchLeaveDocument";
import { fetchImprestDocument } from "../../../features/finance/advanceRequisition";
import ApproveDocument from "./ApproveDocument";
import RejectDocument from "./RejectDocument";
import type { RootState } from "../../../app/store";

import moment from "moment";
import { fetchLeaveDropdownData, selectDropdowns } from "../../../features/leaveApplication/leaveConstantsSlice";

interface ApprovalModalViewerProps {
  record: Record<string, any> | null;
  approverID: string;
  onClose: () => void;
}

const TABLE_IDS = {
  leave: 52202710,
  imprest: 52202786,
  surrender: 52202707,
  purchaseRequisition: 38,
};

const ApprovalDocumentView: React.FC<ApprovalModalViewerProps> = ({
  record,
  approverID,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  const {
    leave: leaveData,
    status: leaveStatus,
    error: leaveError,
  } = useAppSelector(selectLeaveDocument);

  const { relievers } = useAppSelector(selectDropdowns);

  useEffect(() => {
    if (!record) return;

    switch (record.tableID) {
      case TABLE_IDS.leave:
        dispatch(fetchLeaveDocument({ leaveNo: record.documentNo }));
        dispatch(fetchLeaveDropdownData());
        break;
      case TABLE_IDS.imprest:
        dispatch(fetchImprestDocument(record.documentNo));
        break;
      default:
        console.warn("Unknown Table_ID:", record.tableID);
    }
  }, [record, dispatch]);

  const renderTitle = () => {
  if (!record) return null;

  switch (record.tableID) {
    case TABLE_IDS.leave:
      return (
        <div className="mb-3">
          <h6>Leave Application Request</h6>
          <p>
            <strong>Leave No:</strong> {leaveData?.leaveNo || record.documentNo} <br />
            <strong>Staff Name:</strong> {
              relievers.find(r => r.code === leaveData?.staffNo)?.description || "-"
            } <br />
            <strong>Status:</strong> {leaveData?.status || "-"}
          </p>
        </div>
      );

    case TABLE_IDS.imprest:
      return <h5>Imprest Request Details</h5>;

    default:
      return <h5>Document Details</h5>;
  }
};


  const renderLeaveContent = () => {
    if (leaveStatus === "pending") return <Spin />;
    if (leaveError) return <Alert type="error" message={leaveError} />;
    if (!leaveData) return <p>No leave details found</p>;

    const relieverCode = relievers.find(
      (reliever) => reliever.code === leaveData.reliever
    )?.description;

    const requestorName=relievers.find(
      (reliever) => reliever.code === leaveData.staffNo
    )?.description;

    const leaveDataObject = {
      "Leave No": leaveData.leaveNo,
      "Requestor": requestorName,
      "Leave Type": leaveData.leaveType,
      Purpose: leaveData.remarks,
      "Start Date": leaveData.startDate
        ? moment(leaveData.startDate).format("DD/MM/YYYY")
        : "",
      "End Date": leaveData.endDate
        ? moment(leaveData.endDate).format("DD/MM/YYYY")
        : "",
      "Return Date": leaveData.returnDate
        ? moment(leaveData.returnDate).format("DD/MM/YYYY")
        : "",
      Days: leaveData.leaveDays,
      Reliever: relieverCode || leaveData.reliever || "",
      Remarks: leaveData.remarks,
    };

    return (
      <Descriptions bordered column={2} size="small">
        {Object.entries(leaveDataObject).map(([key, value]) => (
          <Descriptions.Item label={key} key={key}>
            {value || "-"}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  const renderContent = () => {
    if (!record) return <p>No data available</p>;

    if (record.tableID === TABLE_IDS.leave) {
      return renderLeaveContent();
    }

    // fallback: raw record
    return (
      <Descriptions bordered column={2} size="small">
        {Object.entries(record).map(([key, value]) => (
          <Descriptions.Item label={key} key={key}>
            {String(value)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  return (
    <Modal
      title="Approval Document View"
      open={!!record}
      onCancel={onClose}
      footer={null}
      width={900}
      style={{
        top: 20,
        background: "transparent",
        boxShadow: "none",
      }}
      bodyStyle={{
        background: "rgba(255, 255, 255, 0.1)",
        padding: "16px",
      }}
    >
      <div>
        <div className="d-flex justify-content-between gap-2 align-items-center">
              {renderTitle()}   {/* <-- custom title per document type */}

        <div className="d-flex justify-content-end gap-2 align-items-center">
          <ApproveDocument
            record={record}
            approverID={approverID}
            onClose={onClose}
          />
          <RejectDocument
            record={record}
            approverID={approverID}
            onClose={onClose}
          />
</div>
        </div>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default ApprovalDocumentView;
