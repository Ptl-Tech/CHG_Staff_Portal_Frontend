import type { RootState } from "../../app/store";
import React, { useEffect, useState } from "react";
import { BookTwoTone, EyeOutlined } from "@ant-design/icons";
import { useDecodedToken } from "../../hooks/useDecodedToken";
import ApprovalDocumentView from "./partials/ApprovalDocumentView";
import { useAppDispatch, useAppSelector } from "../../hooks/ReduxHooks";
import { Button, Card, Skeleton, Space, Table, Tabs, Typography } from "antd";
import { fetchMyApprovalDocuments } from "../../features/approval-management/approvalmgtFile";

const ApprovalsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const decodedToken = useDecodedToken();
  console.log({ decodedToken });

  const nameid = decodedToken?.nameid;

  const [showModal, setShowModal] = useState(false);
  const [activeKey, setActiveKey] = useState("Pending approval");
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  const { data, status } = useAppSelector(
    (state: RootState) => state.approvalMgt,
  );

  console.log({ data });

  useEffect(() => {
    dispatch(fetchMyApprovalDocuments({ approverId: nameid || "" }));
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
      (item: any) =>
        item.status?.toLowerCase() === "rejected" ||
        item.status?.toLowerCase() === "canceled",
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
      <Card
        title={
          <>
            <div>
              <Typography.Title level={5}>
                Documents Approval <BookTwoTone />
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
              children: (
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

      {showModal && selectedDocument && (
        <ApprovalDocumentView
          record={selectedDocument}
          approverID={nameid || ""}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ApprovalsList;
