import { Button, notification } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../hooks/ReduxHooks";
import type { RootState } from "../../../app/store";
import { submitDocumentApproval } from "../../../features/approval-management/approvalmgtFile";

interface ApprovalModalViewerProps {
  record: Record<string, any> | null;
  approverID: string;
  onClose: () => void;
}

const ApproveDocument: React.FC<ApprovalModalViewerProps> = ({
  record,
  approverID,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(
    (state: RootState) => state.approvalMgt
  );
    const [api, contextHolder] = notification.useNotification();
  

  const handleDocumentApproval = async () => {
    if (!record) return;

    const payload = {
      entryNo: record.entryNo,
      docNo: record.documentNo,
      isApproved: true,
      approverID: approverID,
      comments: "",
    };

    try {
      const res = await dispatch(submitDocumentApproval(payload)).unwrap();
      onClose(); 
      api.success({
        message: "Success",
        description: res?.description || "Document approved successfully",
      })
    } catch (err: any) {
     api.error({
       message: "Error",
       description: err?.message || "Something went wrong",
     })
    }
  };

  return (
   <>
    <div>{contextHolder}</div>
    <Button
      type="primary"
      onClick={handleDocumentApproval}
      icon={<CheckOutlined />}
      loading={status === "loading"}
    >
      Approve Document
    </Button>
   </>
  );
};

export default ApproveDocument;
