import {
  CloseOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Space,
  Tooltip,
  Table,
  Spin,
  Modal,
  notification,
} from "antd";
import { useAppDispatch, useAppSelector } from "../../hooks/ReduxHooks";
import { useState } from "react";
import type {
  DocumentData,
  DowloadDocument,
} from "../../types/attachments";
import {
  deleteDocument,
  downloadDocument,
  fetchDocuments,
  selectDeleteDocument,
  selectDocumentsList,
  selectDownloadDocument,
} from "../../features/common/documents";
import {
  downloadFileFromBase64,
  getMimeType,
} from "../../utils/downloadBase64File";

import DocViewer from "./DocViewer";
import UploadFiles from "./UploadDocuments";

interface DocumentListProps {
  visible: boolean;
  documents: DocumentData[];
  tableId: number;
  docNo: string | null;
  onClose: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  visible,
  documents,
  tableId,
  docNo,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { status: documentStatus } = useAppSelector(selectDownloadDocument);
  const { status: deleteStatus } = useAppSelector(selectDeleteDocument);
  const { status: docStatus } = useAppSelector(selectDocumentsList);

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState(false);
  const [modal, modalContextHolder] = Modal.useModal();
  const [api, notificationHolder] = notification.useNotification();

  const showSuccess = (description: string) => {
    api.success({
      message: "Success",
      description,
      style: { borderColor: "#52c41a", fontWeight: "semibold" },
      duration: 3,
    });
  };

  const showError = (description: string) => {
    api.error({
      message: "Error",
      description,
      style: { borderColor: "#ff4d4f", fontWeight: "semibold" },
      duration: 3,
    });
  };

  const handleUploadSuccess = () => {
    dispatch(fetchDocuments({ tableId, docNo }));
    setUploadFile(false);
  };

  // Download file handler
  const handleDownloadDocument = (record: DowloadDocument) => {
    dispatch(
      downloadDocument({
        tableId: record.tableId,
        docNo: record.docNo,
        fileID: record.fileID,
      })
    )
      .unwrap()
      .then((base64String) => {
        const mimeType = getMimeType(record.fileName || "file.pdf");
        downloadFileFromBase64(
          base64String,
          record.fileName || "file.pdf",
          mimeType
        );
      })
      .catch((err) => {
        showError("Failed to download document");
        console.error("Download failed:", err);
      });
  };

  // Confirm delete dialog
  const confirm = (record: DocumentData) => {
    modal.confirm({
      title: "Delete Document",
      icon: <DeleteOutlined />,
      content: "Are you sure you want to delete this document?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => handleDeleteDocument(record),
    });
  };

  // Delete document handler with notifications
  const handleDeleteDocument = (record: DocumentData) => {
    dispatch(
      deleteDocument({
        tableID: record.tableID,
        docNo: record.docNo,
        fileID: record.fileID,
      })
    )
      .unwrap()
      .then(() => {
        showSuccess("Document deleted successfully");
        dispatch(fetchDocuments({ tableId, docNo }));
      })
      .catch((err) => {
        showError("Failed to delete document");
        console.error("Delete failed:", err);
      });
  };

  // Preview file handler
  const handlePreviewDocument = (record: DowloadDocument) => {
    dispatch(
      downloadDocument({
        tableId: record.tableId,
        docNo: record.docNo,
        fileID: record.fileID,
      })
    )
      .unwrap()
      .then((base64String) => {
        const mimeType = getMimeType(record.fileName || "file.pdf");
        const dataUrl = `data:${mimeType};base64,${base64String}`;
        setPreviewDataUrl(dataUrl);
      })
      .catch((err) => {
        showError("Failed to preview document");
        console.error("Preview failed:", err);
      });
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text: string) => (
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
            maxWidth: 180,
          }}
        >
          {text || "Untitled Document"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: DocumentData) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewDocument(record)}
            >
              Preview
            </Button>
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadDocument(record)}
            >
              Download
            </Button>
          </Tooltip>
          <Tooltip title="Delete document">
            <Button
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => confirm(record)}
              danger
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {notificationHolder}
      {modalContextHolder}

      <Card
        title={`Document(s) - ${documents.length}`}
        variant="borderless"
        extra={
          <Space align="center">
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => setUploadFile(true)}
            >
              Upload
            </Button>
          </Space>
        }
      >
        {documentStatus === "loading" ||
        deleteStatus === "loading" ||
        docStatus === "loading" ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 999,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin size="large" fullscreen>
              <span>Please wait...</span>
            </Spin>
          </div>
        ) : (
          <Table
            rowKey={(record) => record.fileID || record.fileName}
            columns={columns}
            dataSource={documents}
            pagination={false}
            locale={{ emptyText: "No documents found" }}
            size="small"
          />
        )}
      </Card>

      {previewDataUrl && (
        <DocViewer
          fileUrl={previewDataUrl}
          onClose={() => setPreviewDataUrl(null)}
        />
      )}

      {uploadFile && (
        <UploadFiles
          tableId={tableId}
          docNo={docNo}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default DocumentList;
