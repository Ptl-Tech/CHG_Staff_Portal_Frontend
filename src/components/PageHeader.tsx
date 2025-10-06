// src/components/layout/PageHeader.tsx

import React from 'react';
import { Button, Typography, Space } from 'antd';
import { ArrowLeftOutlined, PushpinOutlined, PushpinFilled, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  isPinned: boolean;
  onTogglePin: () => void;
  showBack?: boolean;
  showActions?: boolean;
  onSendForApproval?: () => void;
  onCancelApproval?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  isPinned,
  onTogglePin,
  showBack = true,
  showActions = false,
  onSendForApproval,
  onCancelApproval,
}) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: isPinned ? 'sticky' : 'relative',
        top: isPinned ? 0 : 'unset',
        background: isPinned ? '#fff' : 'transparent',
        zIndex: isPinned ? 1 : 'unset',
        paddingBottom: 12,
        paddingTop: 12,
        paddingInline: 20,
        borderBottom: isPinned ? '1px solid #f0f0f0' : 'none',
      }}
    >
      <Space direction="vertical">
        {showBack && (
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
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
