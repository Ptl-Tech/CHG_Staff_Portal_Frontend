import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Skeleton,
  Space,
  Table,
  Tabs,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import TabPane from "antd/es/tabs/TabPane";
import Icon, { BookTwoTone, EyeOutlined } from "@ant-design/icons";
import { useDecodedToken } from "../../../hooks/useDecodedToken";
import { useAppDispatch, useAppSelector } from "../../../hooks/ReduxHooks";
import type { RootState } from "../../../app/store";
import { fetchMyApprovalDocuments } from "../../../features/approval-management/approvalmgtFile";
import ApprovalDocumentView from "../partials/ApprovalDocumentView";

const ApprovalsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const decodedToken = useDecodedToken();
  const approverID = decodedToken?.approverID;

  const [isHeaderPinned, setIsHeaderPinned] = useState(true);
  const [activeKey, setActiveKey] = useState("open");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data, status, error } = useAppSelector(
    (state: RootState) => state.approvalMgt
  );

  useEffect(() => {
    dispatch(fetchMyApprovalDocuments({ approverId: approverID || "" }));
  }, [dispatch, approverID]);
// group approvals by status once
const approvalsByStatus = {
  "Pending approval": data.filter(
    (item: any) => item.status?.toLowerCase() === "pending approval"
  ),
  "Approved Documents": data.filter(
    (item: any) => item.status?.toLowerCase() === "released"
  ),
  "Rejected Documents": data.filter(
    (item: any) => item.status?.toLowerCase() === "rejected" || item.status?.toLowerCase() === "canceled"
  ),
};

  const columns = [
    {
      title: "Document No.",
      dataIndex: "documentNo",
      key: "documentNo",
    },
    {
      title: "Document Type",
      dataIndex: "approvalCode",
      key: "approvalCode",
      
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
              setSelectedDocument(record);
              setShowModal(true);
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
      <Card title={<>
        <div>
          <Typography.Title level={5}>Documents Approval <BookTwoTone /></Typography.Title>
        </div>
        </>} style={{ margin: "20px" }}>
        {status === "loading" ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
         <Tabs activeKey={activeKey} onChange={setActiveKey}>
  {Object.entries(approvalsByStatus).map(([status, items]) => (
    <TabPane tab={status} key={status}>
      <Table
        columns={columns}
        dataSource={items}
        rowKey="documentNo"
        pagination={{ pageSize: 75 }}
      />
    </TabPane>
  ))}
</Tabs>

        )}
      </Card>

      {showModal && selectedDocument && (
        <ApprovalDocumentView
          record={selectedDocument}
          approverID={approverID || ""}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ApprovalsList;
