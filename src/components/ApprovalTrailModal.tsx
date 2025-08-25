// src/features/leave/RequestModal.tsx
import React, { useEffect } from 'react';
import {
  Form,
  Table,
  Tag,
  Typography,
  Modal,
} from 'antd';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../hooks/ReduxHooks';
import { fetchdocApprovalentries, selectDocumentApprovalEntries } from '../features/common/commonSetups';

export interface ApprovalEntries {
  docNo: string;
  userID: string;
  dateSendForApproval: string;
  dueDate: string;
  status: string;
  sequence: number;
}

interface RequestModalProps {
  visible: boolean;
  onClose: () => void;
}

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const ApprovalTrailModal: React.FC<RequestModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const documentNo = new URLSearchParams(window.location.search).get('DocumentNo');

  const { status, error, approvalEntries } = useAppSelector(selectDocumentApprovalEntries);

  useEffect(() => {
    if (visible && documentNo) {
      dispatch(fetchdocApprovalentries(documentNo));
    }
  }, [visible, documentNo, dispatch]);

  console.log('approvalEntries', approvalEntries);
  const columns = [
    { title: 'Document No', dataIndex: 'docNo', key: 'docNo' },
    { title: 'Approver ID', dataIndex: 'approverID', key: 'approverID' },
    {
      title: 'Date Sent for Approval',
      dataIndex: 'dateSendForApproval',
      key: 'dateSendForApproval',
  render: (date: string) => dayjs(date).format('DD/MM/YYYY hh:mm A'),
    },
   
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Approved' ? 'green' : status === 'Pending' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Approver order',
      dataIndex: 'sequenceNo',
      key: 'sequenceNo',
      render: (sequence: number) => <span>{`${getOrdinal(sequence)} Approver`}</span>
      ,
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title="Approval Trail"
      footer={null}
      destroyOnClose
      style={{ top: 20 }}
      width={800}
    >
      <Table
        columns={columns}
        size='small'
        dataSource={approvalEntries || []}
        rowKey={(record) => `${record.docNo}-${record.sequence}`}
        bordered
        pagination={false}
        loading={status === 'pending'}
      />
      {error && <Typography.Text type="danger">{error}</Typography.Text>}
    </Modal>
  );
};

export default ApprovalTrailModal;
