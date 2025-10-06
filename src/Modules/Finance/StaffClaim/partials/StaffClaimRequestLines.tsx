import React from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Select,
  Button,
  Card,
  Typography,
  Tooltip,
  Space,
  Table,
  Modal,
  notification,
} from 'antd';
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ClaimLineData, DimensionValues, ExpenditureTypes, JobPlanningLines, PaymentData } from '../../../../types/PaymentData';
import { formatCurrencyUSD } from '../../../../utils/currencyFormmatter';
import moment from 'moment';
import StaffClaimModal from './StaffClaimModal';
import { deleteLineItem } from '../../../../features/common/deleteLineItem';
import { fetchPaymentDocumentLines } from '../../../../features/finance/commonRequest';
import { useAppDispatch } from '../../../../hooks/ReduxHooks';

const { TextArea } = Input;
const { Option } = Select;

interface RequestLinesProps {
  documentNo?: string | null;
  documentStatus?: string | null;
  requestLines: ClaimLineData[]; 
   listOfClaimLineTypes: ExpenditureTypes[];
    listOfActivities: JobPlanningLines[];
    listofProjectCodes: DimensionValues[];
}

const StaffClaimRequestLines: React.FC<RequestLinesProps> = ({
  requestLines,
  documentStatus,
  listOfClaimLineTypes,
  listOfActivities, 
  listofProjectCodes
}) => {
    const dispatch = useAppDispatch();
  
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingLine, setEditingLine] = React.useState<ClaimLineData | undefined>(undefined);
  const [modal, modalContextHolder] = Modal.useModal();
  const [api, notificationHolder] = notification.useNotification();

    const confirmDelete = (record: ClaimLineData) => {
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
  
    const handleDeleteLine = (record: ClaimLineData) => {
      dispatch(
        deleteLineItem({
          docNo: requestLines[0]?.documentNo || '',
          lineNo: record.lineNo,
          endpoint: '/Finance/delete-claim-line',
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
                fetchPaymentDocumentLines({
                  documentNo: requestLines[0]?.documentNo || '',
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
    {
      title: 'Line No',
      dataIndex: 'lineNo',
      key: 'lineNo',
    },
    {
      title: 'Expenditure Type',
      dataIndex: 'expenditureType',
      key: 'expenditureType',
    },
    {
      title: 'Description',
      dataIndex: 'lineDescription',
      key: 'lineDescription',
    },
    {
      title: 'Expenditure Date',
      dataIndex: 'expenditureDate',
      key: 'expenditureDate',
      render: (date: string) => (date ? moment(date).format('DD/MM/YYYY') : 'N/A'),
    },
    {
      title: 'Daily Rate',
      dataIndex: 'lineAmount',
      key: 'lineAmount',
      render: (amount: number) => (
        <span style={{ color: 'green', fontWeight: 600 }}>
          {formatCurrencyUSD(amount)}
        </span>
      ),
    },
  ];

  // Conditionally add actions column if document is not approved
  if (documentStatus !== 'approved') {
    baseColumns.push({
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClaimLineData) => (
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
                     <Button type="text" onClick={() => confirmDelete(record)} danger>
                       Delete
                     </Button>
                   </Tooltip>
        </Space>
      ),
    });
  }

  return (
    <>
      <Typography.Title level={5}>Request Lines</Typography.Title>
       {/* Example: trigger to add new line if editable */}
      {documentStatus !== 'approved' && (
        <Button
          type="dashed"
          style={{ marginTop: 12, marginBottom:12 }}
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add Line
        </Button>
      )}
      <Table
        dataSource={requestLines}
        columns={baseColumns}
        rowKey={(record) => record.lineNo ?? Math.random().toString()}
        pagination={false}
        locale={{ emptyText: 'No request lines available' }}
      />
     
      <StaffClaimModal
          visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingLine(undefined);
        }}
        listofExpenditureTypes={listOfClaimLineTypes}
        listOfActivities={listOfActivities}
        listofProjectCodes={listofProjectCodes}
        initialLine={editingLine}
        onSave={(line, isEdit) => {
          
        }}
        
      />
        {modalContextHolder}
      {notificationHolder}
    </>
  );
};

export default StaffClaimRequestLines;
