import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Skeleton, Table, Tabs, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import { fetchVehicleRequestList, selectedVehicleRequestList } from '../../../../features/vehicleRequests/VehicleRequisitions';
import { EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const VehicleRequisitions: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { list, status, error } = useAppSelector(selectedVehicleRequestList);

    useEffect(() => {
        dispatch(fetchVehicleRequestList());
    }, [dispatch]);

    const columns = [
        {
            title: 'Index',
            key: 'index',
            render: (_: any, __: any, index: number) => index + 1,
            width: 60,
            fixed: 'left',
        },
        {
            title: 'Requisition No.',
            dataIndex: 'documentNo',
            key: 'documentNo',
            render: (text: string) => (
                <a
                    style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                    onClick={() => navigate(`/logistics/Vehicle-Requisition?DocumentNo=${text}`)}
                >
                    {text}
                </a>
            ),
        },
        {
            title: 'Request Date',
            dataIndex: 'requestDate',
            key: 'requestDate',
            render: (date: string) => (date ? moment(date).format('DD/MM/YYYY') : 'N/A'),
        },
        {
            title: 'Travel Destination',
            dataIndex: 'travelDestination',
            key: 'travelDestination',
            render: (text: string | null | undefined) =>
                text && text.trim() !== '' ? (
                    <Text style={{ color: 'blue', cursor: 'pointer', textTransform: 'capitalize' }}>{text}</Text>
                ) : (
                    <Text style={{ color: 'red', fontStyle: 'italic' }}>No Travel Destination recorded</Text>
                ),
        },
        {
            title: 'Trip Authorizor',
            dataIndex: 'tripAuthorizor',
            key: 'tripAuthorizor',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    onClick={() => navigate(`/logistics/Vehicle-Requisition?DocumentNo=${record.documentNo}`)}
                    icon={<EyeOutlined />}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <Card
            title="Vehicle Requests"
            style={{ margin: '20px' }}
            extra={
                <Button type="primary" onClick={() => navigate('/logistics/Vehicle-Requisition')}>
                    New Vehicle Request
                </Button>
            }
        >
            {status === 'pending' ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : error ? (
                <Text type="danger">Error: {error}</Text>
            ) : (
               <Table
                            columns={columns}
                            dataSource={list.map((item) => ({ ...item, key: item.documentNo }))}
                            pagination={{ pageSize: 50 }}
                        />
            )}
        </Card>
    );
};

export default VehicleRequisitions;
