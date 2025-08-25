import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Skeleton, Table, Tabs, Tooltip, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import { fetchPurchaseRequisitions, selectPurchaseRequests } from '../../../../features/purchaseRequisitions/purchaseRequisitions';
import { fetchVehicleRequestList, selectedVehicleRequestList } from '../../../../features/vehicleRequests/VehicleRequisitions';
import { fetchTravelRequestList, selectedTravelRequestList } from '../../../../features/TravelRequest/TravelRequisitions';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TravelRequests: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { list, status, error } = useAppSelector(selectedTravelRequestList);
    const [activeKey, setActiveKey] = useState('open');

    useEffect(() => {
        dispatch(fetchTravelRequestList());

    }, [dispatch]);

    // Grouped Data
    const grouped = {
        open: list.filter((req) => req.status?.toLowerCase() === 'open'),
        pending: list.filter((req) => req.status?.toLowerCase() === 'pending approval'),
        released: list.filter((req) => req.status?.toLowerCase() === 'approved'),
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
            dataIndex: 'documentNo',
            key: 'documentNo',
            render: (text: string) => <a style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }} onClick={() => navigate(`/logistics/Travel-Requisition-Document?DocumentNo=${text}`)}>{text}</a>,
        },
        {
            title: 'Travel Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
        },
        {
            title: "Travel Destination",
            dataIndex: 'destination',
            key: 'destination',
            render: (text: string | null | undefined) =>
                text && text.trim() !== '' ? (
                    <Text style={{  cursor: 'pointer', textTransform: "capitalize" }}>
                        {text}
                    </Text>
                ) : (
                    <Text style={{ color: 'red', fontStyle: 'italic' }}>
                        No Travel Destination recorded
                    </Text>
                ),
        },

        {
            title: "Mode of Transport",
            dataIndex: 'modeofTransport',
            key: 'modeofTransport',
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
                <Tooltip title="View Requisition">
                    <Button type="primary" icon={<EyeOutlined/>} onClick={() => navigate(`/logistics/Travel-Requisition-Document?DocumentNo=${record.documentNo}`)}>
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
            <Card title="Travel Requests" style={{ margin: '20px' }}
                extra={
                    <Button type="primary" onClick={() => navigate('/logistics/New-Travel-Requisition')}>
                        New Travel Request</Button>}>

                {status === 'pending' ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : error ? (
                    <Text type="danger">Error: {error}</Text>
                ) : (
                    <>
                        <Tabs
                            //tabPosition="left"
                            activeKey={activeKey}
                            onChange={setActiveKey}
                            style={{ minHeight: '400px' }}
                        >
                            {tabItems.map((tab) => (
                                <TabPane tab={tab.label} key={tab.key}>
                                    <Table
                                        columns={columns}
                                        dataSource={tab.content.map((item) => ({ ...item, key: item.documentNo }))} pagination={{ pageSize: 75 }}
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

export default TravelRequests;
