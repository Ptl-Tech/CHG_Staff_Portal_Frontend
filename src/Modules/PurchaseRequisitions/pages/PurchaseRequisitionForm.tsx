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
    Divider,
    notification
} from 'antd';
import {
    CalendarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import PurchaseHeader from '../partials/PurchaseHeader';
import PageHeader from '../../../components/PageHeader';
import { fetchPurchaseDocument, fetchPurchaseRequestLines, fetchPurchaseRequisitions, submitPurchaseHeader } from '../../../features/purchaseRequisitions/purchaseRequisitions';
import { useAppDispatch } from '../../../hooks/ReduxHooks';
import { cancelApproval } from '../../../features/common/cancelApprovalReq';
import { sendForApproval } from '../../../features/common/sendforApproval';

const { TextArea } = Input;
const { Option } = Select;

const PurchaseRequisitionForm: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [isHeaderPinned, setIsHeaderPinned] = React.useState(true);
    const purchaseDocNo = new URLSearchParams(window.location.search).get('DocumentNo');


    const [api, contextHolder] = notification.useNotification();

    const handleHeaderSubmit = (newDocNo: string) => {
        dispatch(fetchPurchaseDocument({ documentNo: newDocNo }));
        dispatch(fetchPurchaseRequestLines({ documentNo: newDocNo }));

        const params = new URLSearchParams();
        params.set('DocumentNo', newDocNo);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const handleSendForApproval = () => {
        if (!purchaseDocNo) return;

        dispatch(
            sendForApproval({
                docNo: purchaseDocNo,
                endpoint: `/Procurement/send-approval?docNo=${purchaseDocNo}`,
            })
        )
            .unwrap()
            .then((response) => {
             api.success({
                    message: 'Success',
                    description: response.message,
                    duration: 3,
                    onClose: () => {
                        navigate('/procurement/purchase-requisition');

                        dispatch(fetchPurchaseRequisitions());
                    },
                });

            })
            .catch((error) => {
                api.error({
                    message: 'Error',
                    description: error?.message || 'Failed to send for approval',
                    duration: 3,
                });
            });
    };


    const handleCancelApproval = () => {
        if (!purchaseDocNo) return;

        dispatch(
            cancelApproval({
                docNo: purchaseDocNo,
                endpoint: `/Procurement/cancel-approval?docNo=${purchaseDocNo}`,
            })
        )
            .unwrap()
            .then((response) => {
                api.success({
                    message: 'Success',
                    description: response.message,
                    duration: 3,
                    onClose: () => {
                        navigate('/procurement/purchase-requisition');

                        dispatch(fetchPurchaseRequisitions());
                    },
                });

            })
            .catch((error) => {
                api.error({
                    message: 'Error',
                    description: error?.message || 'Failed to send for approval',
                    duration: 3,
                });
            });
    };

    return (
        <div >
            <PageHeader
                title="Purchase Requisition"
                isPinned={isHeaderPinned}
                onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                showActions={true}
                onSendForApproval={handleSendForApproval}
                onCancelApproval={handleCancelApproval}
            />
            <Card style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <PurchaseHeader onSubmit={handleHeaderSubmit} />
                <Divider />
            </Card>
        </div>
    );
};

export default PurchaseRequisitionForm;
