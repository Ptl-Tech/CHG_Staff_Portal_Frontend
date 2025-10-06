import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Skeleton,
  Table,
  Tabs,
  Typography,
  Space,
  Modal,
  Select,
  Row,
  Col,
  Form,
  message,
  Tooltip,
  notification,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { EyeOutlined } from '@ant-design/icons';

import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import {
  fetchAdvanceSurrenderList,
  fetchImprestList,
  selectAdvanceSurrenderList,
  selectImprestList,
  selectSubmitImprestSurrender,
  submitImprestSurrender,
} from '../../../../features/finance/advanceSurrender';
import { formatCurrencyUSD } from '../../../../utils/currencyFormmatter';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TravelAdvanceSurrenderList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { imprestSurrenderList, status, error } = useAppSelector(selectAdvanceSurrenderList);
  const { imprestList } = useAppSelector(selectImprestList);
  const { status: submitStatus } = useAppSelector(selectSubmitImprestSurrender);

  const [activeKey, setActiveKey] = useState('open');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImprest, setSelectedImprest] = useState<string | null>(null);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    dispatch(fetchAdvanceSurrenderList());
    dispatch(fetchImprestList());
  }, [dispatch]);

  const handleSelect = (value: string) => {
    setSelectedImprest(value);
  };

  const handleSubmit = () => {
    if (!selectedImprest) {
      message.warning('Please select an imprest document before submitting.');
      return;
    }
    const payload={
      surrenderDocNo:'',
    imprestIssueDocNo: selectedImprest
    }

    dispatch<any>(submitImprestSurrender(payload))
      .unwrap()
      .then((res: any) => {
        api.success({
          message: 'Success',
          description: res.description,
          duration: 3,
          onClose: () => {
            setModalVisible(false);
            navigate(`/finance/Travel-Advance-Surrender?DocumentNo=${selectedImprest}`);
          },
        });
      })
      .catch((err: any) => {
        const errorMessage = err?.message || 'Failed to submit imprest surrender';
        api.error({
          message: 'Error',
          description: errorMessage,
          duration: 3,
        });
      });
  };

  const grouped = {
    open: imprestSurrenderList.filter((req) => req.status?.toLowerCase() === 'open'),
    pending: imprestSurrenderList.filter((req) => req.status?.toLowerCase() === 'pending approval'),
    released: imprestSurrenderList.filter((req) => req.status?.toLowerCase() === 'approved'),
  };

  const columns = [
    {
      title: 'Index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      fixed: 'left',
    },
    {
      title: 'Requisition No.',
      dataIndex: 'paymentNo',
      render: (text: string) => (
        <a
          style={{
            color: 'blue',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontWeight: 'bold',
          }}
          onClick={() =>
            navigate(`/finance/Travel-Advance-Surrender?DocumentNo=${text}`)
          }
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Date Requested',
      dataIndex: 'dateRequested',
      render: (date: string) =>
        date ? moment(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Imprest Issue Doc No.',
      dataIndex: 'imprestIssueDocNo',
    },
    {
      title: 'Imprest Amount',
      dataIndex: 'imprestAmount',
      render: (amount: number) =>
        amount ? formatCurrencyUSD(amount) : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Action',
      render: (_: any, record: any) => (
        <Tooltip title="View Details">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(
                `/finance/Travel-Advance-Surrender?DocumentNo=${record.paymentNo}`
              )
            }
          >
            View
          </Button>
        </Tooltip>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'open',
      label: (
        <Badge count={grouped.open.length} offset={[10, 0]}>
          Open Requests
        </Badge>
      ),
      content: grouped.open,
    },
    {
      key: 'pending',
      label: (
        <Badge count={grouped.pending.length} offset={[10, 0]}>
          Pending Approval
        </Badge>
      ),
      content: grouped.pending,
    },
    {
      key: 'released',
      label: (
        <Badge count={grouped.released.length} offset={[10, 0]}>
          Released
        </Badge>
      ),
      content: grouped.released,
    },
  ];

  return (
    <>
      <Card
        title="Advance Surrender"
        style={{ margin: '20px' }}
        extra={
          <Button
            type="primary"
            onClick={() => setModalVisible(true)}
            style={{ marginLeft: 10 }}
          >
            Surrender Amount
          </Button>
        }
      >
        {status === 'pending' ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : error ? (
          <Text type="danger">Error: {error}</Text>
        ) : (
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            style={{ minHeight: '400px' }}
          >
            {tabItems.map((tab) => (
              <TabPane tab={tab.label} key={tab.key}>
                <Table
                  columns={columns}
                  dataSource={tab.content.map((item) => ({
                    ...item,
                    key: item.paymentNo,
                  }))}
                  pagination={{ pageSize: 75 }}
                />
              </TabPane>
            ))}
          </Tabs>
        )}
      </Card>

      {contextHolder}

      <Modal
        title="Select Imprest Document"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Submit
          </Button>,
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
        ]}
        destroyOnClose
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form layout="vertical">
              <Form.Item
                label="Imprest Issue No."
                required
                validateStatus={
                  !selectedImprest && submitStatus === 'failed' ? 'error' : ''
                }
                help={
                  !selectedImprest && submitStatus === 'failed'
                    ? 'Please select an Imprest Document'
                    : ''
                }
              >
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Search imprest document"
                  value={selectedImprest || undefined}
                  onChange={handleSelect}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {imprestList.map((item) => (
                    <Select.Option key={item.code} value={item.code}>
                      {`${item.code} - ${item.description}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default TravelAdvanceSurrenderList;
