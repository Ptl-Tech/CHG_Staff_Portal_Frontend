import React from "react";
import {
  PushpinFilled,
  CheckOutlined,
  CloseOutlined,
  PushpinOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Space } from "antd";

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  isPinned: boolean;
  showBack?: boolean;
  showActions?: boolean;
  onTogglePin: () => void;
  onCancelApproval?: () => void;
  onSendForApproval?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  isPinned,
  onTogglePin,
  showActions,
  showBack = true,
  onCancelApproval,
  onSendForApproval,
}) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        paddingTop: 12,
        paddingBottom: 12,
        paddingInline: 20,
        alignItems: "center",
        top: isPinned ? 0 : "unset",
        zIndex: isPinned ? 1 : "unset",
        justifyContent: "space-between",
        position: isPinned ? "sticky" : "relative",
        background: isPinned ? "#fff" : "transparent",
        borderBottom: isPinned ? "1px solid #f0f0f0" : "none",
      }}
    >
      <Space direction="vertical">
        {showBack && (
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        )}
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
      </Space>

      <Space>
        {showActions && (
          <>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={onSendForApproval}
              style={{ marginRight: 8 }}
            >
              Send for Approval
            </Button>
            <Button
              danger
              type="default"
              icon={<CloseOutlined />}
              onClick={onCancelApproval}
            >
              Cancel Approval
            </Button>
          </>
        )}
        <Button
          type="text"
          icon={isPinned ? <PushpinFilled /> : <PushpinOutlined />}
          onClick={onTogglePin}
          title="Pin/Unpin Header"
        />
      </Space>
    </div>
  );
};

export default PageHeader;
