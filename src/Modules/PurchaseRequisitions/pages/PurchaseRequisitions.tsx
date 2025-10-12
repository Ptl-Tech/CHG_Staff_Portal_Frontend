import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Skeleton, Table, Tabs, Tooltip, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    fetchPurchaseRequisitions,
    selectPurchaseRequests,
} from '../../../features/purchaseRequisitions/purchaseRequisitions';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import moment from 'moment';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const PurchaseRequisitions: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { purchaseRequests, status, error } = useAppSelector(selectPurchaseRequests);
    const [activeKey, setActiveKey] = useState('open');

    useEffect(() => {
                   dispatch(fetchPurchaseRequisitions());

    }, [dispatch ]);

    // Grouped Data
    const grouped = {
        open: purchaseRequests.filter((req) => req.status?.toLowerCase() === 'open'),
        pending: purchaseRequests.filter((req) => req.status?.toLowerCase() === 'pending approval'),
        released: purchaseRequests.filter((req) => req.status?.toLowerCase() === 'released'),
    };

    const columns:any = [
        {
            title: 'Index',
            dataIndex: 'index',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
            width: 60,
            fixed: 'left',
        },
        {
            title: 'Requisition No',
            dataIndex: 'documentNo',
            key: 'documentNo',
            render: (text: string) => <a style={{ cursor: 'pointer',fontWeight: 'bold' }} onClick={() => navigate(`/procurement/Purchase-Document?DocumentNo=${text}`)}>{text}</a>,
            sorter: (a: any, b: any) => a.documentNo.localeCompare(b.documentNo),
            sortDirections: ['ascend', 'descend'],
            ellipsis: true,
        },
        {
            title: 'Request Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
        },
        {
            title: "Purchase Description",
            dataIndex: 'reasonDescription',
            key: 'reasonDescription',
            render: (text: string | null | undefined) =>
                text && text.trim() !== '' ? (
                    <Text style={{ cursor: 'pointer', textTransform: "capitalize" }}>
                        {text}
                    </Text>
                ) : (
                    <Text style={{ color: 'red', fontStyle: 'italic' }}>
                        No reason recorded
                    </Text>
                ),
        },

        {
            title: "Procurement Plan",
            dataIndex: 'procurementPlan',
            key: 'procurementPlan',
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
        <Tooltip title="View Requisition">
            <Button
                type="primary"
                onClick={() => navigate(`/procurement/Purchase-Document?DocumentNo=${record.documentNo}`)}
                icon={<EyeOutlined />}
            >
                View Requisition
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
            <Card title="Purchase Requisition" style={{ margin: '20px' }}
                extra={
                    <Button type="primary" onClick={() => navigate('/procurement/New-Purchase-Requisition')}
                     icon={<PlusOutlined />}
                    >
                        New Purchase Request</Button>}>

                  <Tabs
                           // tabPosition="left"
                            activeKey={activeKey}
                            onChange={setActiveKey}
                            style={{ minHeight: '400px', //spsace between tabs//
                                 borderRight: '1px solid #ccc',
                            }}
                        >
                            {tabItems.map((tab) => (
                                <TabPane tab={tab.label} key={tab.key}>
                                    <Table
                                    loading={status === 'pending'}
                                        columns={columns}
                                        dataSource={tab.content.map((item) => ({ ...item, key: item.documentNo }))}
                                 pagination={{
                                    defaultPageSize: 45,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['25', '50', '75', '100'],
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                }}
                                                                scroll={{ x: 'max-content' }}

                                    />
                                </TabPane>
                            ))}
                        </Tabs>
            </Card>
        </>
    );
};

export default PurchaseRequisitions;
