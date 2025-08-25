// src/features/leave/LeaveApplicationForm.tsx
import React from 'react';
import {
  Typography,
  Space,
  Table,
  Button,
  Tooltip,
  Modal,
  notification,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type {
  DimensionValues,
  ExpenditureTypes,
  JobPlanningLines,
  PaymentData,
  PaymentLinesData,
} from '../../../../types/PaymentData';
import { formatCurrencyUSD } from '../../../../utils/currencyFormmatter';
import AdvanceRequestLineModal from './AdvanceRequestLineModal';
import { useAppDispatch } from '../../../../hooks/ReduxHooks';
import { deleteLineItem } from '../../../../features/common/deleteLineItem';
import { fetchImprestLines, fetchPaymentDocumentLines } from '../../../../features/finance/commonRequest';

interface RequestLinesProps {
  documentStatus?: string | null;
  requestLines: PaymentLinesData[];
  listOfExpenditureTypes: ExpenditureTypes[];
  listOfActivities: JobPlanningLines[];
  listofProjectCodes: DimensionValues[];
  documentDetails?: PaymentData | null;
}

const AdvanceRequestLines: React.FC<RequestLinesProps> = ({
  requestLines,
  listOfExpenditureTypes,
  listOfActivities,
  listofProjectCodes,
  documentStatus,
  documentDetails,
}) => {
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingLine, setEditingLine] = React.useState<
    PaymentLinesData | undefined
  >(undefined);

  const [modal, modalContextHolder] = Modal.useModal();
  const [api, notificationHolder] = notification.useNotification();

  const confirmDelete = (record: PaymentLinesData) => {
    modal.confirm({
      title: 'Delete Line Item',
      icon: <DeleteOutlined />,
      content: 'Are you sure you want to delete this Line Item?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => handleDeleteLine(record),
    });
  };

  const handleDeleteLine = (record: PaymentLinesData) => {
    dispatch(
      deleteLineItem({
        docNo: documentDetails?.paymentNo || '',
        lineNo: record.lineNo,
        endpoint: '/Finance/delete-imprest-line',
      })
    )
      .unwrap()
      .then((res) => {
        api.success({
          message: 'Success',
          description: res.description,
          duration: 3,
          onClose: () =>
            dispatch(
              fetchImprestLines({
                documentNo: documentDetails?.paymentNo || '',
              })
            ),
        });
      })
      .catch((err) => {
        api.error({
          message: 'Error',
          description: err?.message || 'Failed to delete line',
        });
      });
  };


  const baseColumns: any[] = [
    { title: 'Line No', dataIndex: 'lineNo', key: 'lineNo' },
    { title: 'Project Name', dataIndex: 'projectName', key: 'projectName' },
    { title: 'Account Name', dataIndex: 'accountName', key: 'accountName' },
    { title: 'Task Name', dataIndex: 'taskName', key: 'taskName' },
    { title: 'No of Days', dataIndex: 'noOfDays', key: 'noOfDays' },
    {
      title: 'Daily Rate',
      dataIndex: 'dailyRate',
      key: 'dailyRate',
      render: (amount: number) => (
        <span style={{ color: 'green', fontWeight: 600 }}>
          {formatCurrencyUSD(amount)}
        </span>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'lineAmount',
      key: 'lineAmount',
      render: (amount: number) => (
        <span style={{ color: 'green', fontWeight: 600 }}>
          {formatCurrencyUSD(amount)}
        </span>
      ),
    },
  ];

  if (documentStatus !== 'approved') {
    baseColumns.push({
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PaymentLinesData) => (
        <Space size="small">
          <Tooltip title="Edit line">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingLine(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Remove line">
            <Button
              type="text"
              onClick={() => confirmDelete(record)}
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    });
  }

  return (
    <>
      <Typography.Title level={5}>Request Lines</Typography.Title>
      {documentStatus !== 'approved' && documentStatus !== 'Pending Approval' && (
        <Button
          type="primary"
          style={{ marginTop: 12, marginBottom: 12, float: 'right' }}
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Line
        </Button>
      )}

      <Table
        dataSource={requestLines}
        size="small"
        bordered
        columns={baseColumns}
        rowKey={(record) =>
          record.lineNo?.toString() || Math.random().toString()
        }
        pagination={false}
        locale={{ emptyText: 'No request lines available' }}
        scroll={{ x: 'max-content' }}
      />

      <AdvanceRequestLineModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingLine(undefined);
        }}
        listofExpenditureTypes={listOfExpenditureTypes}
        listOfActivities={listOfActivities}
        listofProjectCodes={listofProjectCodes}
        initialLine={editingLine}
        documentDetails={documentDetails}
      />

      {modalContextHolder}
      {notificationHolder}
    </>
  );
};

export default AdvanceRequestLines;
