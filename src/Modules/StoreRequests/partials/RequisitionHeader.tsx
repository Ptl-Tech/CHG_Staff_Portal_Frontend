// src/features/requisition/RequisitionHeader.tsx
import React, { useEffect } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Button,
  Typography,
  Tooltip,
  Card,
  Select,
} from 'antd';
import {
  AppstoreAddOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import moment from 'moment';

import PageHeader from '../../../components/PageHeader';
import ApprovalTrailModal from '../../../components/ApprovalTrailModal';
import type { DropdownOptions } from '../../../types/dropdown';


const { TextArea } = Input;

interface HeaderProps {
  onSubmit: (newDocNo: string) => void;
  issuingStoreSetup: DropdownOptions[];
}

const RequisitionHeader: React.FC<HeaderProps> = ({
  onSubmit,
  issuingStoreSetup
}) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = React.useState(false);



  const SubmitHeader = (values: any) => {
    const payload = {
      ...values,
      documentDate: values.documentDate
        ? values.documentDate.format('YYYY-MM-DD')
        : null,
      expectedReceiptDate: values.expectedReceiptDate
        ? values.expectedReceiptDate.format('YYYY-MM-DD')
        : null,
    };
    console.log('Form Data:', payload);
    onSubmit(payload.documentNo || '');
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={SubmitHeader}
        autoComplete="off"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            width: '100%',
          }}
        >
          <Typography.Text>
            <strong>
              <u>Requisition Header</u>
            </strong>
          </Typography.Text>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <Tooltip title="File Attachment">
              <Button type="text" icon={<FileTextOutlined />}>
                File Attachment
              </Button>
            </Tooltip>
            <Tooltip title="Approval Trail">
              <Button
                type="default"
                icon={<AppstoreAddOutlined />}
                onClick={() => setModalVisible(true)}
              >
                View Approval Trail
              </Button>
            </Tooltip>
          </div>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Request Date"
              name="documentDate"
              rules={[
                { required: true, message: 'Please select a request date' },
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Required Date"
              name="expectedReceiptDate"
              rules={[
                { required: true, message: 'Please select a required date' },
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Issuing Location"
              name="location"
              rules={[
                { required: true, message: 'Please enter issuing location' },
              ]}
            >
              <Select placeholder="Select Issuing Location">
                {issuingStoreSetup?.map((option) => (
                  <Select.Option key={option.code} value={option.code}>
                    {option.description}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>


          <Col span={24}>
            <Form.Item label="Description" name="reason">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <ApprovalTrailModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default RequisitionHeader;
