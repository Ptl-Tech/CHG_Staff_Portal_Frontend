import {
  Tabs,
  Card,
  Alert,
  Table,
  Badge,
  Button,
  Popover,
  Skeleton,
} from "antd";
import {
  EyeOutlined,
  SendOutlined,
  CloseOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import type { AnyObject } from "antd/es/_util/type";

import { customToast } from "../../../../components/Toast";
import {
  fetchLeaves,
  selectLeaveList,
} from "../../../../features/leaveApplication/leaveListSlice";
import { useAppDispatch, useAppSelector } from "../../../../hooks/ReduxHooks";
import { sendForApproval } from "../../../../features/common/sendforApproval";
import {
  cancelApproval,
  resetCancelApproval,
} from "../../../../features/common/cancelApprovalReq";
import { resetSendApprovalState } from "../../../../features/common/sendforApproval";

const LeaveApplications: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { leaves, status, error } = useAppSelector(selectLeaveList);
  const {
    error: sendApprovalError,
    status: sendApprovalStatus,
    message: sendApprovalMessage,
  } = useAppSelector((state) => state.approval);
  const {
    error: cancelApprovalError,
    status: cancelApprovalStatus,
    message: cancelApprovalMessage,
  } = useAppSelector((state) => state.cancelApproval);

  const [activeKey, setActiveKey] = useState("open");

  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  useEffect(() => {
    if (sendApprovalStatus === "succeeded") {
      dispatch(fetchLeaves());
      customToast({
        status: "success",
        title: "Success",
        description:
          sendApprovalMessage ||
          "You have successfully sent the leave for approval",
      });
      dispatch(resetSendApprovalState());
    } else if (sendApprovalStatus === "failed" && sendApprovalError) {
      customToast({
        title: "Error",
        status: "error",
        description:
          sendApprovalError ||
          "Something went wrong when submitting the request",
      });
      dispatch(resetSendApprovalState());
    }
  }, [sendApprovalStatus, sendApprovalError, sendApprovalMessage]);

  useEffect(() => {
    if (cancelApprovalStatus === "succeeded") {
      dispatch(fetchLeaves());
      customToast({
        status: "success",
        title: "Success",
        description:
          cancelApprovalMessage ||
          "You have successfully cancelled the leave for approval",
      });
      dispatch(resetCancelApproval());
    } else if (cancelApprovalError || cancelApprovalStatus === "failed") {
      customToast({
        title: "Error",
        status: "error",
        description:
          cancelApprovalMessage ||
          "Something went wrong when cancelling the request",
      });
      dispatch(resetCancelApproval());
    }
  }, [cancelApprovalError, cancelApprovalMessage, cancelApprovalStatus]);

  // Categorize leaves by status
  const openRequests = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "open",
  );
  const pendingApprovals = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "pending approval",
  );
  const releasedLeaves = leaves.filter(
    (leave) => leave.status?.toLowerCase() === "released",
  );

  const handleSendForApproval = (record: AnyObject) => {
    const { leaveNo } = record;
    if (!leaveNo) return;

    dispatch(
      sendForApproval({
        docNo: leaveNo,
        endpoint: `/Leave/send-approval?leaveNo=${leaveNo}`,
      }),
    );
  };

  const handleCancelApproval = (record: AnyObject) => {
    const { leaveNo } = record;

    if (!leaveNo) return;

    dispatch(
      cancelApproval({
        docNo: leaveNo,
        endpoint: `/Leave/cancel-approval?leaveNo=${leaveNo}`, // use `leaveNo` not `docNo`
      }),
    );
  };

  const Content = ({ record }: { record: AnyObject }) => {
    return (
      <div className="d-grid gap-1">
        <Button
          type="primary"
          onClick={() =>
            navigate(
              `/Leave Application/Leave-Document?DocumentNo=${record.leaveNo}`,
            )
          }
          icon={<EyeOutlined />}
        >
          View Document
        </Button>
        <Button
          icon={<SendOutlined />}
          disabled={["Released", "Pending Approval"].includes(record.status)}
          onClick={() => handleSendForApproval(record)}
        >
          Send for approval
        </Button>
        <Button
          icon={<CloseOutlined />}
          disabled={["Released", "Open"].includes(record.status)}
          onClick={() => handleCancelApproval(record)}
        >
          Cancel approval
        </Button>
      </div>
    );
  };

  const columns: ColumnsType = [
    {
      title: "Index",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      fixed: "left",
    },
    {
      title: "Leave Application No",
      dataIndex: "leaveNo",
      key: "leaveNo",
      fixed: "left",
      //render as link
      render: (text: string) => (
        <a
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
          onClick={() =>
            navigate(`/Leave Application/Leave-Document?DocumentNo=${text}`)
          }
        >
          {text}
        </a>
      ),
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: string) => value || "Pending",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_: any, record: AnyObject) => (
        <Popover
          title="Actions"
          trigger="click"
          content={<Content record={record} />}
        >
          <Button icon={<EllipsisOutlined />} />
        </Popover>
      ),
    },
  ];

  const tabItems = [
    {
      key: "open",
      label: (
        <Badge count={openRequests.length} offset={[10, 0]}>
          <span>Open Requests</span>
        </Badge>
      ),
      content: openRequests,
    },
    {
      key: "pending",
      label: (
        <Badge count={pendingApprovals.length} offset={[10, 0]}>
          <span>Pending Approval</span>
        </Badge>
      ),
      content: pendingApprovals,
    },
    {
      key: "released",
      label: (
        <Badge count={releasedLeaves.length} offset={[10, 0]}>
          <span>Released</span>
        </Badge>
      ),
      content: releasedLeaves,
    },
  ];

  const tabs = tabItems.map((tab) => ({
    key: tab.key,
    label: tab.label,
    children: (
      <Table
        columns={columns}
        pagination={{ pageSize: 75 }}
        dataSource={tab.content.map((item) => ({
          ...item,
          key: item.leaveNo,
        }))}
      />
    ),
  }));

  return (
    <Card
      title="Leave Applications"
      style={{ margin: "20px" }}
      extra={
        <Button
          type="primary"
          onClick={() => navigate("/Leave Application/Apply-Leave")}
        >
          Create New Application
        </Button>
      }
    >
      {status === "pending" ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          style={{ minHeight: "400px" }}
          items={tabs}
        />
      )}
    </Card>
  );
};

export default LeaveApplications;
