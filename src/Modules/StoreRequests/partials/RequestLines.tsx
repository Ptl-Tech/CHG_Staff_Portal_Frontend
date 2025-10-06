// src/features/leave/LeaveApplicationForm.tsx
import React from 'react';
import {
    Form,
    Input,
    DatePicker,
    Row,
    Col,
    Select,
    Button,
    Card,
    Typography,
    Tooltip,
    Space,
    Table,
    Modal,
    notification
} from 'antd';
import {
    CalendarOutlined,
    DeleteOutlined,
    FileTextOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { StoreRequisition } from '../../../types/storeRequest';
import PageHeader from '../../../components/PageHeader';
import RequestModal from './RequestModal';
import { fetchStoreRequestLines, type StoreReqLine } from '../../../features/storeRequisitions/storeRequests';
import { useAppDispatch } from '../../../hooks/ReduxHooks';
import { deleteLineItem } from '../../../features/common/deleteLineItem';

const { TextArea } = Input;
const { Option } = Select;

interface RequestLinesProps {
    documentNo?: string | null;
    requestLines?: [];

}

const RequestLines: React.FC<RequestLinesProps> = ({ documentNo, requestLines }) => {
    const dispatch =useAppDispatch();
    const [form] = Form.useForm();
    const [modal, modalContextHolder] = Modal.useModal();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [api, notificationHolder] = notification.useNotification();
    
  
    const confirmDelete = (record: StoreReqLine) => {
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

    const handleDeleteLine = (record: StoreReqLine) => {
        dispatch(
            deleteLineItem({
                docNo: documentNo || '',
                lineNo: record.lineNo,
                endpoint: '/Procurement/delete-store-line',
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
                            fetchStoreRequestLines({
                                documentNo: documentNo || '',
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
        {
            title: 'Line No ',
            dataIndex: 'lineNo',
            key: 'lineNo',
        },
        {
            title: 'Issuing store ',
            dataIndex: 'issuingstore',
            key: 'issuingstore',
        },
        {
            title: 'Item ',
            dataIndex: 'itemDescription',
            key: 'itemDescription',
        },
        {
            title: 'Quantity in Stock',
            dataIndex: 'quantityinStock',
            key: 'quantityinStock',
        },
        {
            title: 'Quantity Requested',
            dataIndex: 'quantityRequested',
            key: 'quantityRequested',
        },
        {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: StoreReqLine) => (
        <Space size="small">
          {/* <Tooltip title="Edit line">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingLine(record);
                setModalVisible(true);
              }}
            />
          </Tooltip> */}
          <Tooltip title="Remove line">
            <Button
              type="text"
              onClick={() => confirmDelete(record)}
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    }
    ]


    return (
        <div >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    width: '100%',
                }}
            >
                <Typography.Text><strong><u>Requisition Lines</u></strong></Typography.Text>
                <Tooltip title="New Requisition Line">
                    <Button type="default" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                        New Line
                    </Button>
                </Tooltip>
            </div>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Table columns={columns} dataSource={requestLines} />
            </Space>
            <RequestModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
            {notificationHolder}
            {modalContextHolder}
        </div>
    );
};

export default RequestLines;
