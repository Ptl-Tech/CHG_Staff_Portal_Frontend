import React, { useMemo } from 'react';
import {
    Form,
    Input,
    Row,
    Col,
    Select,
    Button,
    Typography,
    Tooltip,
    Space,
    Table,
    Modal,
    notification
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { formatCurrencyUSD } from '../../../utils/currencyFormmatter';
import type { PurchaseLineItem, PurchasePlanItemsList } from '../../../types/purchaseRequisitions';
import RequestLineModal from './RequestLineModal';
import { useAppDispatch } from '../../../hooks/ReduxHooks';
import { deleteLineItem } from '../../../features/common/deleteLineItem';
import { fetchPurchaseRequestLines } from '../../../features/purchaseRequisitions/purchaseRequisitions';

const { Option } = Select;

interface RequestLinesProps {
    documentNo?: string | null;
    requestLines?: PurchaseLineItem[];
    purchasePlanItemsList?: PurchasePlanItemsList[];
}

const RequestLines: React.FC<RequestLinesProps> = ({ requestLines = [], purchasePlanItemsList }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    const [modalVisible, setModalVisible] = React.useState(false);
    const [editingLine, setEditingLine] = React.useState<PurchaseLineItem | undefined>(undefined);
    const [modal, modalContextHolder] = Modal.useModal();
    const [api, notificationHolder] = notification.useNotification();

    // Calculate total dynamically
    const totalAmount = useMemo(() => {
        return requestLines.reduce((acc, line) => acc + (line.amount || 0), 0);
    }, [requestLines]);

    const confirmDelete = (record: PurchaseLineItem) => {
        modal.confirm({
            title: 'Delete Line Item',
            icon: <DeleteOutlined />,
            content: 'Are you sure you want to delete this Line Item?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => handleDeleteLine(record),
        });
    };

    const handleDeleteLine = (record: PurchaseLineItem) => {
        dispatch(
            deleteLineItem({
                docNo: record?.documentNo || '',
                lineNo: record.lineNo,
                endpoint: '/Procurement/delete-purchase-line',
            })
        )
            .unwrap()
            .then((res) => {
                api.success({
                    message: 'Success',
                    description: res.description,
                    duration: 3,
                    onClose: () =>
                        dispatch(
                            fetchPurchaseRequestLines({
                                documentNo: record?.documentNo || '',
                            })
                        ),
                });
            })
            .catch((err) => {
                api.error({
                    message: 'Error',
                    description: err?.message || 'Failed to delete line',
                });
            });
    };

    const columns = [
        { title: 'Line No', dataIndex: 'lineNo', key: 'lineNo' },
        { title: 'Item', dataIndex: 'procurementItem', key: 'procurementItem' },
        { title: 'Procurement Plan Description', dataIndex: 'procurementItemDescription', key: 'procurementItemDescription' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
        {
            title: 'Estimated Cost (Line Amount)',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (
                <span style={{ color: 'green', fontWeight: 600 }}>
                    {amount ? formatCurrencyUSD(amount) : 'N/A'}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: PurchaseLineItem) => (
                <Space>
                    <Tooltip title="Edit line">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingLine(record);
                                setModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Line">
                        <Button
                            type="default"
                            icon={<DeleteOutlined />}
                            onClick={() => confirmDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Text><strong><u>Requisition Lines</u></strong></Typography.Text>
                <Tooltip title="New Requisition Line">
                    <Button type="default" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                        New Line
                    </Button>
                </Tooltip>
            </div>

      

            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Table columns={columns} dataSource={requestLines} pagination={false} rowKey="lineNo" />
            </Space>
      {/* Total Amount Display */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f0f2f5',
                padding: '8px 16px',
                borderRadius: '50px',
                marginBottom: 16,
                fontWeight: 600,
                marginTop:14
            }}>
                <span>Total Amount</span>
                <span style={{ color: 'green' }}>{formatCurrencyUSD(totalAmount)}</span>
            </div>
            <RequestLineModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingLine(undefined);
                }}
                itemsList={purchasePlanItemsList}
                initialValues={editingLine}
            />

            {notificationHolder}
            {modalContextHolder}
        </div>
    );
};

export default RequestLines;
