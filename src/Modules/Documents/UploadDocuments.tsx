import { InboxOutlined } from "@ant-design/icons";
import { Upload, Progress, notification } from "antd";
import type { UploadProps } from "antd";
import axios from "axios";
import { useState } from "react";
import { getPersistedTokens } from "../../utils/token";

const { Dragger } = Upload;
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface UploadFilesProps {
  tableId: number;
  docNo: string|null;
  onSuccess?: (newDoc: {
    fileName: string;
    fileExtension: string;
    fileID: number;
    tableId: number;
    docNo: string;
  }) => void;
}

const UploadFiles: React.FC<UploadFilesProps> = ({
  tableId,
  docNo,
  onSuccess,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [api, contextHolder] = notification.useNotification();

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

  const props: UploadProps = {
    name: "file",
    multiple: false,
    customRequest: async ({ file, onSuccess: antSuccess, onError }) => {
      try {
        setIsUploading(true);
        const { token, bcToken } = getPersistedTokens();
        const reader = new FileReader();

        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(",")[1];
            const fileName = (file as File).name;
            const fileExtension = fileName.split(".").pop() || "";

            const payload = {
              docNo,
              base64File: base64,
              fileName,
              fileExtension,
              tableID: tableId,
            };

            const response = await axios.post(
              `${API_ENDPOINT}/Common/document/upload`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "BC-Authorization": bcToken,
                },
                onUploadProgress: (event) => {
                  if (event.total) {
                    const percent = Math.round(
                      (event.loaded / event.total) * 100
                    );
                    setProgress(percent);
                  }
                },
              }
            );

            setProgress(100);
            showSuccess("File uploaded successfully");

            if (onSuccess) onSuccess(response.data);
            if (antSuccess) antSuccess("ok");

            setTimeout(() => {
              setProgress(0);
              setIsUploading(false);
            }, 1000);
          } catch (uploadErr) {
            showError("File upload failed");
            setProgress(0);
            setIsUploading(false);
            if (onError) onError(uploadErr as Error);
          }
        };

        reader.onerror = () => {
          showError("Failed to read file");
          setProgress(0);
          setIsUploading(false);
          if (onError) onError(new Error("File reading failed"));
        };

        reader.readAsDataURL(file as File);
      } catch (err) {
        showError("Unexpected error during upload");
        setProgress(0);
        setIsUploading(false);
        if (onError) onError(err as Error);
      }
    },
  };

  return (
    <>
      {contextHolder}
      <div style={{ position: "relative" }}>
        <Dragger {...props} disabled={isUploading}>
          {isUploading ? (
            <div style={{ padding: "40px 0" }}>
              <Progress
                type="circle"
                percent={progress}
                strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
              />
              <p style={{ marginTop: 16 }}>
                Uploading... {progress}%
              </p>
            </div>
          ) : (
            <>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single file upload.
              </p>
            </>
          )}
        </Dragger>
      </div>
    </>
  );
};

export default UploadFiles;
