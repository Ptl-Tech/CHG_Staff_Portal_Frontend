import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Typography, Spin, Alert, Tabs, Badge, Card, Skeleton, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import { selectLeaveList, fetchLeaves } from '../../../../features/leaveApplication/leaveListSlice';
import moment from 'moment';
import { EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;

const LeaveApplications: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { leaves, status, error } = useAppSelector(selectLeaveList);

  const [activeKey, setActiveKey] = useState('open');

useEffect(() => {
 dispatch(fetchLeaves());
}, [dispatch]);

  // Categorize leaves by status
  const openRequests = leaves.filter((leave) => leave.status?.toLowerCase() === 'open');
  const pendingApprovals = leaves.filter((leave) => leave.status?.toLowerCase() === 'pending approval');
  const releasedLeaves = leaves.filter((leave) => leave.status?.toLowerCase() === 'released');

  const columns = [
    
    {
      title: 'Index',
      dataIndex: 'index',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      fixed: 'left',
    },
    {
      title: 'Leave Application No',
      dataIndex: 'leaveNo',
      key: 'leaveNo',
      fixed: 'left',
      //render as link
      render: (text: string) => <a style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }} onClick={() => navigate(`/Leave Application/Leave-Document?DocumentNo=${text}`)}>{text}</a>,
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render:(date: string) => date ?moment(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
            render:(date: string) => date ?moment(date).format('DD/MM/YYYY') : 'N/A',

    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => value || 'Pending',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
         <Tooltip title="View Document Details">
           <Button type="primary" onClick={() => navigate(`/Leave Application/Leave-Document?DocumentNo=${record.leaveNo}`)} icon={<EyeOutlined/>}>
            View Document
          </Button>
          </Tooltip>  
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'open',
      label: (
        <Badge count={openRequests.length} offset={[10, 0]}>
          <span>Open Requests</span>
        </Badge>
      ),
      content: openRequests,
    },
    {
      key: 'pending',
      label: (
        <Badge count={pendingApprovals.length} offset={[10, 0]}>
          <span>Pending Approval</span>
        </Badge>
      ),
      content: pendingApprovals,
    },
    {
      key: 'released',
      label: (
        <Badge count={releasedLeaves.length} offset={[10, 0]}>
          <span>Released</span>
        </Badge>
      ),
      content: releasedLeaves,
    },
  ];

  return (
    <Card title="Leave Applications" style={{ margin: '20px' }}
      extra={
        <Button type="primary" onClick={() => navigate('/Leave Application/Apply-Leave')}>
        Create New Application</Button>}>



      {status === 'pending' ? (
        <Skeleton active  paragraph={{ rows: 4 }}/>
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        <Tabs
         // tabPosition="left"
          activeKey={activeKey}
          onChange={setActiveKey}
          style={{ minHeight: '400px' }}
        >
          {tabItems.map((tab) => (
            <TabPane tab={tab.label} key={tab.key}>
              <Table
                columns={columns}
                dataSource={tab.content.map((item) => ({ ...item, key: item.leaveNo }))}
                pagination={{ pageSize: 75 }}
              />
            </TabPane>
          ))}
        </Tabs>
      )}
    </Card>
  );
};

export default LeaveApplications;
