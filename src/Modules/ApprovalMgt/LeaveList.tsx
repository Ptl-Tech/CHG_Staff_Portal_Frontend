import type { RootState } from "../../app/store";
import React, { useEffect, useState } from "react";
import { BookTwoTone, EyeOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { useDecodedToken } from "../../hooks/useDecodedToken";
import { useAppDispatch, useAppSelector } from "../../hooks/ReduxHooks";
import {
  Button,
  Card,
  Modal,
  Skeleton,
  Space,
  Table,
  Tabs,
  Typography,
} from "antd";
import { approveLeaveRequest } from "../../features/leaveApplication/approveLeaveRequest";
import { fetchMyLeaveApprovalDocuments } from "../../features/approval-management/leavemgtFiles";
import { cancelLeaveRequest } from "../../features/leaveApplication/cancelLeaveRequest";
import {
  selectApproveLeave,
  resetApproveLeaveState,
} from "../../features/leaveApplication/approveLeaveSlice";
import {
  selectCancelLeave,
  resetCancelLeaveState,
} from "../../features/leaveApplication/cancelLeaveSlice";

const LeaveList: React.FC = () => {
  const dispatch = useAppDispatch();
  const decodedToken = useDecodedToken();

  const nameid = decodedToken?.nameid;

  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState("Pending approval");
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  const { data, status } = useAppSelector(
    (state: RootState) => state.leaveApprovalMgt,
  );

  useEffect(() => {
    dispatch(fetchMyLeaveApprovalDocuments({ approverId: nameid || "" }));
  }, [dispatch, nameid]);

  // group approvals by status once
  const approvalsByStatus = {
    "Pending approval": data.filter(
      (item: any) => item.status?.toLowerCase() === "pending approval",
    ),
    "Approved Documents": data.filter(
      (item: any) => item.status?.toLowerCase() === "released",
    ),
    "Rejected Documents": data.filter(
      (item: any) => item.status?.toLowerCase() === "cancelled",
    ),
  };

  const columns = [
    {
      title: "Leave No.",
      dataIndex: "no",
      key: "no",
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setOpen(true);
              setSelectedDocument(record);
            }}
            icon={<EyeOutlined />}
          >
            View Document
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <>
            <div>
              <Typography.Title level={5}>
                Leave Approval <BookTwoTone />
              </Typography.Title>
            </div>
          </>
        }
        style={{ margin: "20px" }}
      >
        {status === "loading" ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            defaultActiveKey={"Pending approval"}
            items={Object.entries(approvalsByStatus).map(([status, data]) => ({
              key: status,
              label: status,
              children:
                data.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#999",
                    }}
                  >
                    <Typography.Text>
                      No {status.toLowerCase()} documents
                    </Typography.Text>
                  </div>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="documentNo"
                    pagination={{ pageSize: 75 }}
                  />
                ),
            }))}
          />
        )}
      </Card>

      <ApproveLeaveDocumentView
        open={open}
        record={selectedDocument}
        approverID={nameid || ""}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

const ApproveLeaveDocumentView = ({
  open,
  record,
  onClose,
  approverID,
}: {
  record: any;
  open: boolean;
  approverID: string;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const approveLeave = useAppSelector(selectApproveLeave);
  const cancelLeave = useAppSelector(selectCancelLeave);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle approve leave response
  useEffect(() => {
    if (approveLeave.status === "succeeded") {
      toast.success("Leave request approved successfully!", {
        style: {
          background: "#10b981",
          color: "#fff",
          border: "1px solid #059669",
        },
      });
      dispatch(resetApproveLeaveState());
      dispatch(fetchMyLeaveApprovalDocuments({ approverId: approverID }));
      setIsProcessing(false);
      onClose();
    } else if (approveLeave.status === "failed") {
      toast.error(approveLeave.error || "Failed to approve leave request", {
        style: {
          background: "#ef4444",
          color: "#fff",
          border: "1px solid #dc2626",
        },
      });
      dispatch(resetApproveLeaveState());
      setIsProcessing(false);
    }
  }, [approveLeave.status, approveLeave.error, dispatch, approverID, onClose]);

  // Handle cancel leave response
  useEffect(() => {
    if (cancelLeave.status === "succeeded") {
      toast.success("Leave request rejected successfully!", {
        style: {
          background: "#3b82f6",
          color: "#fff",
          border: "1px solid #2563eb",
        },
      });
      dispatch(resetCancelLeaveState());
      dispatch(fetchMyLeaveApprovalDocuments({ approverId: approverID }));
      setIsProcessing(false);
      onClose();
    } else if (cancelLeave.status === "failed") {
      toast.error(cancelLeave.error || "Failed to reject leave request", {
        style: {
          background: "#f97316",
          color: "#fff",
          border: "1px solid #ea580c",
        },
      });
      dispatch(resetCancelLeaveState());
      setIsProcessing(false);
    }
  }, [cancelLeave.status, cancelLeave.error, dispatch, approverID, onClose]);

  const onApprove = () => {
    setIsProcessing(true);
    dispatch(approveLeaveRequest({ leaveNo: record.no }));
  };

  const onReject = () => {
    setIsProcessing(true);
    dispatch(cancelLeaveRequest({ leaveNo: record.no }));
  };

  if (!record) return;

  const isPendingApproval =
    record?.status?.toLowerCase() === "pending approval";

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      title={`Leave Details for ${record?.employeeName}`}
      width={700}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {isPendingApproval && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-start",
            }}
          >
            <Button
              type="primary"
              onClick={onApprove}
              loading={isProcessing && approveLeave.status === "pending"}
              disabled={isProcessing}
            >
              Approve Leave Request
            </Button>
            <Button
              danger
              onClick={onReject}
              loading={isProcessing && cancelLeave.status === "pending"}
              disabled={isProcessing}
            >
              Reject Leave Request
            </Button>
          </div>
        )}
        <CustomDescriptions
          items={
            record
              ? Object.entries(record)?.map(([key, value], index) => ({
                  key: index,
                  label: key,
                  children: value,
                }))
              : []
          }
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          <Button onClick={onClose}>Close</Button>
        </div>
      </Space>
    </Modal>
  );
};

const CustomDescriptions = ({
  items,
  columns = 1,
}: {
  columns?: number;
  items: {
    key: number;
    label: string;
    children: any;
  }[];
}) => {
  const borderRadius = "12px";
  const newItems = items.filter((item) => item.children);

  return (
    <ul
      style={{
        borderRadius,
        paddingLeft: 0,
        display: "grid",
        overflow: "hidden",
        listStyleType: "none",
        borderTop: "1px solid #aaaaaa",
        borderLeft: "1px solid #aaaaaa",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {newItems.map((item, index) => (
        <li
          key={item.key}
          style={{
            marginLeft: 0,
            display: "grid",
            overflow: "hidden",
            gridTemplateColumns: `repeat(2, 1fr)`,
          }}
        >
          <span
            style={{
              overflow: "hidden",
              padding: "8px 16px",
              textTransform: "capitalize",
              backgroundColor: "#efefef",
              borderRight: "1px solid #aaaaaa",
              borderBottom: "1px solid #aaaaaa",
              borderBottomLeftRadius:
                index === newItems.length - 1 ? borderRadius : 0,
            }}
          >
            {item.label
              .replace(/([A-Z])/g, " $1") // Add space before capital letters
              .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
              .trim()}
          </span>
          <span
            style={{
              overflow: "hidden",
              padding: "8px 16px",
              textTransform: "capitalize",
              borderRight: "1px solid #aaaaaa",
              borderBottom: "1px solid #aaaaaa",
              borderTopRightRadius: index === 0 ? borderRadius : 0,
              borderBottomRightRadius:
                index === newItems.length - 1 ? borderRadius : 0,
            }}
          >
            {item.children}
          </span>
        </li>
      ))}
    </ul>
  );
};
export default LeaveList;
