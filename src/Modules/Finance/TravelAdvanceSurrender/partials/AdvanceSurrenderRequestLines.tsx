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
} from 'antd';
import {
  CalendarOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ClaimLineData, ImprestSurrenderLineData, PaymentData } from '../../../../types/PaymentData';
import { formatCurrencyUSD } from '../../../../utils/currencyFormmatter';
import moment from 'moment';
import SurrenderAmountModal from './SurrenderAmountModal';

const { TextArea } = Input;
const { Option } = Select;

interface RequestLinesProps {
  documentStatus?: string | null;
  requestLines: ImprestSurrenderLineData[]; // array expected
}

const AdvanceSurrenderRequestLines: React.FC<RequestLinesProps> = ({
  requestLines,
  documentStatus,
}) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingLine, setEditingLine] = React.useState<ImprestSurrenderLineData | undefined>(undefined);

  console.log('request lines', requestLines);
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
      title: 'Account Name',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Additional Comments',
      dataIndex: 'additionalComments',
      key: 'additionalComments',
    },
    {
      title: 'No of Days',
      dataIndex: 'noOfDays',
      key: 'noOfDays'
    },
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
    {
      title: 'Actual Spent',
      dataIndex: 'actualSpent',
      key: 'actualSpent',
      render: (amount: number) => (
        <span style={{ color: 'green', fontWeight: 600 }}>
          {formatCurrencyUSD(amount)}
        </span>
      ),
    }
  ];

  if (documentStatus !== 'approved') {
    baseColumns.push({
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ImprestSurrenderLineData) => (
        <Space size="small">
        <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingLine(record);
                setModalVisible(true);
              }}
            >Edit
            </Button>
         
        </Space>
      ),
    });
  }

  return (
    <>
      <Typography.Title level={5}>Request Lines</Typography.Title>
     
      <Table
        dataSource={requestLines}
        size="small"
        bordered
        columns={baseColumns}
        rowKey={(record) => record.lineNo ?? Math.random().toString()}
        pagination={false}
        locale={{ emptyText: 'No request lines available' }}
        scroll={{ x: 'max-content' }}
      />


      <SurrenderAmountModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingLine(undefined);
        }}
        initialLine={editingLine}

      />
    </>
  );
};

export default AdvanceSurrenderRequestLines;
