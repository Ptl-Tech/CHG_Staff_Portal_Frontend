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
  notification,
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
import { RequestOptions } from '../constants/RequestOptions';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { selectSubmitStoreRequest, submitStoreRequest } from '../../../features/storeRequisitions/storeRequests';


const { TextArea } = Input;

interface HeaderProps {
  onSubmit: (newDocNo: string) => void;
}

const RequisitionHeader: React.FC<HeaderProps> = ({
  onSubmit
}) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = React.useState(false);
  const { status, error } = useAppSelector(selectSubmitStoreRequest);

  const [api, contextHolder] = notification.useNotification();

const SubmitHeader = async (values: any) => {
  const payload = {
    ...values,
    docNo: '',
    requestDate: values.requestDate
      ? values.requestDate.format('YYYY-MM-DD')
      : null,
  };


  try {
    const res = await dispatch(submitStoreRequest(payload)).unwrap();

    api.success({
      message: 'Success',
      description: res.description,
      onClose: () => {
        if (res) onSubmit(res.description);
      },
    });
  } catch (err: any) {
    api.error({
      message: 'Submission Failed',
      description: err?.message || 'Something went wrong',
      duration: 3,
    });
  }
};


  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={SubmitHeader}
        autoComplete="off"
      >
        {contextHolder}
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
              label="Request Type"
              name="requestType"
              rules={[
                { required: true, message: 'Please select a request type' },
              ]}
            >
              <Select placeholder="Select Requisition Type">
                {RequestOptions.map(opt => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>

            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Required Date"
              name="requestDate"
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
          <Col span={24}>
            <Form.Item label="Description" name="requestDescription">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" htmlType="submit">
            Submit Requisition
          </Button>
        </div>
      </Form>

      <ApprovalTrailModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default RequisitionHeader;
