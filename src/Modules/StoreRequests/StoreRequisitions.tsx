import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Skeleton, Space, Table, Tabs, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { useAppDispatch, useAppSelector } from '../../hooks/ReduxHooks';
import { fetchStoreRequisitions, selectStoreRequisitions } from '../../features/storeRequisitions/storeRequests';
import moment from 'moment';
import TabPane from 'antd/es/tabs/TabPane';
import { EyeOutlined } from '@ant-design/icons';

const StoreRequisitions: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { status, storeRequests, error } = useAppSelector(selectStoreRequisitions);
    

    const [isHeaderPinned, setIsHeaderPinned] = useState(true);
    const [activeKey, setActiveKey] = useState('open');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        dispatch(fetchStoreRequisitions());
    }, [dispatch]);

    const handleSendForApproval = () => {
        console.log('Send for approval');
    };

    const handleCancelApproval = () => {
        console.log('Cancel approval');
    };

    const handleGeneratePayroll = () => {
        console.log('Generating payroll from', startDate, 'to', endDate);
    };

    // Grouped Data
    const grouped = {
        open: storeRequests.filter((req) => req.status?.toLowerCase() === 'open'),
        pending: storeRequests.filter((req) => req.status?.toLowerCase() === 'pending approval'),
        released: storeRequests.filter((req) => req.status?.toLowerCase() === 'released'),
    };

    const columns = [
        {
            title: 'Requisition No.',
            dataIndex: 'documentNo',
            key: 'documentNo',
        },
        {
            title: 'Order Date',
            dataIndex: 'documentDate',
            key: 'documentDate',
            render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
        },
        {
            title: 'Issuing Store',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Issue Date',
            dataIndex: 'expectedReceiptDate',
            key: 'expectedReceiptDate',
            render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
        },
        {
            title: 'Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Button type="primary" onClick={() => navigate(`/procurement/Store-Document?DocumentNo=${record.documentNo}`)} icon={<EyeOutlined />}>View</Button>
                </Space>
            )
        },


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
            <Card title="Store Requisition" style={{ margin: '20px' }}
                extra={
                    <Button type="primary" onClick={() => navigate('/procurement/Store-Document')}>New Store Request</Button>
                }>

                {status === 'loading' ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : error ? (
                    <Typography.Text type="danger">Error: {error}</Typography.Text>
                ) : (
                    <>
                        <Tabs
                            // tabPosition="left"
                            activeKey={activeKey}
                            onChange={setActiveKey}
                            style={{
                                minHeight: '400px', //spsace between tabs//
                                borderRight: '1px solid #ccc',
                            }}
                        >
                            {tabItems.map((tab) => (
                                <TabPane tab={tab.label} key={tab.key}>
                                    <Table
                                        columns={columns}
                                        dataSource={tab.content.map((item) => ({ ...item, key: item.documentNo }))}
                                        pagination={{ pageSize: 75 }}
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

export default StoreRequisitions;
