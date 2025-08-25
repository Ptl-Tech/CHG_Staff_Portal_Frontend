import { Modal, Button } from "antd";

interface TransparentModalViewerProps {
  fileUrl: string;
  onClose: () => void;
}

const DocViewer: React.FC<TransparentModalViewerProps> = ({ fileUrl, onClose }) => {
  return (
    <Modal
      title="Attachment Preview"
      open={true}
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
        padding: 0,
      }}
    
    
    >
      <iframe
        src={fileUrl}
        style={{
          width: "100%",
          height: "80vh",
          border: "none",
          background: "transparent",
        }}
        title="Document Preview"
      />
    </Modal>
  );
};

export default DocViewer;
