import { Button, Modal, Input, notification } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../hooks/ReduxHooks";
import type { RootState } from "../../../app/store";
import { submitDocumentApproval } from "../../../features/approval-management/approvalmgtFile";
import { useState } from "react";

interface ApprovalModalViewerProps {
  record: Record<string, any> | null;
  approverID: string;
  onClose: () => void;
}

const RejectDocument: React.FC<ApprovalModalViewerProps> = ({
  record,
  approverID,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state: RootState) => state.approvalMgt);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [api, contextHolder] = notification.useNotification();

  const handleReject = async () => {
    if (!record) return;

    const payload = {
      entryNo: record.entryNo,
      docNo: record.documentNo, 
      isApproved: false,
      approverID: approverID,
      comments: comments,
    };

    try {
      const res = await dispatch(submitDocumentApproval(payload)).unwrap();
      setIsModalOpen(false);
      setComments("");
      api.success({
        message: "Success",
        description: res?.description || "Document rejected successfully",
      });
      onClose(); 
    } catch (err: any) {
      api.error({
        message: "Error",
        description: err?.message || "Something went wrong",
      });
      setIsModalOpen(false);
      setComments("");
    }
  };

  return (
    <>
      <Button
        type="default"
        danger
        onClick={() => setIsModalOpen(true)}
        icon={<CloseOutlined />}
      >
        Reject Document
      </Button>
      {contextHolder}
      <Modal
        title="Reject Document"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleReject}
        confirmLoading={status === "loading"}
        okText="Submit Rejection"
        cancelText="Cancel"
      >
        <p>Please provide comments for rejection:</p>
        <Input.TextArea
          rows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter rejection reason..."
        />
      </Modal>
    </>
  );
};

export default RejectDocument;
