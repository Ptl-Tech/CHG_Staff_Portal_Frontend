import {
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Space,
  Tooltip,
  Table,
  Spin,
  notification,
} from "antd";
import { useAppDispatch, useAppSelector } from "../../hooks/ReduxHooks";
import { useEffect } from "react";
import type { DocumentData, DowloadDocument } from "../../types/attachments";
import {
  downloadHRDocument,
  fetchHRDocuments,
  selectDeleteDocument,
  selectDownloadDocument,
  selectHRDocumentsList,
} from "../../features/common/documents";
import {
  downloadFileFromBase64,
  getMimeType,
} from "../../utils/downloadBase64File";

const HRDocuments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status: documentStatus } = useAppSelector(selectDownloadDocument);
  const { status: deleteStatus } = useAppSelector(selectDeleteDocument);
  const { status: docStatus, documents } = useAppSelector(selectHRDocumentsList);

  const [api, notificationHolder] = notification.useNotification();

  useEffect(() => {
    dispatch(fetchHRDocuments());
  }, [dispatch]);

  const showError = (description: string) => {
    api.error({
      message: "Error",
      description,
      style: { borderColor: "#ff4d4f", fontWeight: "semibold" },
      duration: 3,
    });
  };

  const handleDownloadDocument = (record: DowloadDocument) => {
    dispatch(downloadHRDocument(record.docNo))
      .unwrap()
      .then((baseImage) => {
        const mimeType = getMimeType(record.fileName || "file.pdf");
        downloadFileFromBase64(
          baseImage.baseImage,
          record.fileName || "file.pdf",
          mimeType
        );
      })
      .catch((err) => {
        showError("Failed to download document");
        console.error("Download failed:", err);
      });
  };

  const handlePreviewDocument = (record: DowloadDocument) => {
    dispatch(downloadHRDocument(record.docNo))
      .unwrap()
      .then((baseImage) => {
        const mimeType = "application/pdf";
        const dataUrl = `data:${mimeType};base64,${baseImage.baseImage}`;

        // Open new tab with an iframe displaying the PDF
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`
            <html>
              <head>
                <title>Preview - ${record.fileName || "HR Document"}</title>
                <style>
                  body, html { margin: 0; height: 100%; overflow: hidden; }
                  iframe { border: none; width: 100%; height: 100%; }
                </style>
              </head>
              <body>
                <iframe src="${dataUrl}" frameborder="0"></iframe>
              </body>
            </html>
          `);
          newTab.document.close();
        }
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
        </Space>
      ),
    },
  ];

  return (
    <>
      {notificationHolder}

      <Card title={`HR Document(s) - ${documents.length}`} variant="borderless">
        {["loading"].includes(documentStatus || deleteStatus || docStatus) ? (
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
            rowKey={(record) => record.docNo || record.fileName}
            columns={columns}
            dataSource={documents}
            pagination={false}
            locale={{ emptyText: "No documents found" }}
            size="small"
          />
        )}
      </Card>
    </>
  );
};

export default HRDocuments;
