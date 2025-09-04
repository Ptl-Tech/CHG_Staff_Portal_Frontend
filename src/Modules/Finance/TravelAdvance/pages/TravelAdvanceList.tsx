import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Skeleton, Table, Tabs, Tooltip, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';

import { fetchAdvanceRequestList, selectAdvanceImprestList } from '../../../../features/finance/advanceRequisition';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TravelAdvanceList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { imprestList, status, error } = useAppSelector(selectAdvanceImprestList);
    const [activeKey, setActiveKey] = useState('open');

    useEffect(() => {
        dispatch(fetchAdvanceRequestList());

    }, [dispatch]);
console.log("imprestList", imprestList);
    // Grouped Data
    const grouped = {
        open: imprestList.filter((req) => req.status?.toLowerCase() === 'pending'),
        pending: imprestList.filter((req) => req.status?.toLowerCase() === 'pending approval'),
        released: imprestList.filter((req) => req.status?.toLowerCase() === 'approved'),
    };

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
            title: 'Requisition No.',
            dataIndex: 'paymentNo',
            key: 'paymentNo',
            render: (text: string) => <a style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }} onClick={() => navigate(`/finance/Travel-Advance?DocumentNo=${text}`)}>{text}</a>,
        },
        {
            title: 'Date Requested',
            dataIndex: 'dateRequested',
            key: 'dateRequested',
            render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
        },
        {
            title: "Reason Description",
            dataIndex: 'purpose',
            key: 'purpose',
            render: (text: string | null | undefined) =>
                text && text.trim() !== '' ? (
                    <Text style={{ cursor: 'pointer', textTransform: "capitalize" }}>
                        {text}
                    </Text>
                ) : (
                    <Text style={{ color: 'blue', fontStyle: 'italic' }}>
                        No data recorded
                    </Text>
                ),
        },

       
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title:'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_: any, record: any) => (
              <Tooltip title="View Details">
                  <Button type="primary" icon={<EyeOutlined />} onClick={() => navigate(`/finance/Travel-Advance?DocumentNo=${record.paymentNo}`)}>
                    View
                </Button>
                </Tooltip>
            ),
        }
    ];

    const tabItems = [
        {
            key: 'open',
            label: (
                <Badge count={grouped.open.length} offset={[10, 0]}>
                    <span>Open Requests</span>
                </Badge>
            ),

            content: grouped.open,
        },
        {
            key: 'pending',
            label: (
                <Badge count={grouped.pending.length} offset={[10, 0]}>
                    <span>Pending Approval</span>
                </Badge>
            ),
            content: grouped.pending,
        },
        {
            key: 'released',
            label: (
                <Badge count={grouped.released.length} offset={[10, 0]}>
                    <span>Released</span>
                </Badge>
            ),
            content: grouped.released,
        },
    ];

    return (
        <>
            <Card title="Imprest Requests" style={{ margin: '20px' }}
                extra={
                    <Button type="primary" onClick={() => navigate('/finance/Travel-Advance')}>
                        New Imprest Request</Button>}>

                {status === 'pending' ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : error ? (
                    <Text type="danger">Error: {error}</Text>
                ) : (
                    <>
                        <Tabs
                            activeKey={activeKey}
                            onChange={setActiveKey}
                            style={{ minHeight: '400px' }}
                        >
                            {tabItems.map((tab) => (
                                <TabPane tab={tab.label} key={tab.key}>
                                    <Table
                                        columns={columns}
                                        dataSource={tab.content.map((item) => ({ ...item, key: item.paymentNo }))} pagination={{ pageSize: 75 }}
                                    />
                                </TabPane>
                            ))}
                        </Tabs>
                    </>
                )}
            </Card>
        </>
    );
};

export default TravelAdvanceList;
