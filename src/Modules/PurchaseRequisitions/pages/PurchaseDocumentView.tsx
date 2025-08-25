// src/features/leave/LeaveApplicationForm.tsx
import React, { useEffect, useState } from 'react';
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
    Skeleton,
    message,
    Spin,
    notification
} from 'antd';
import {
    CalendarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';
import { fetchPurchaseDocument, fetchPurchaseRequestLines, fetchPurchaseRequisitions, selectPurchaseDocument, selectPurchaseRequestLines } from '../../../features/purchaseRequisitions/purchaseRequisitions';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import EditPurchaseHeader from '../partials/EditPurchaseHeader';
import RequestLines from '../partials/RequestLines';
import { cancelApproval, selectCancelApprovalApplication } from '../../../features/common/cancelApprovalReq';
import { selectApprovalApplication, sendForApproval } from '../../../features/common/sendforApproval';

const { TextArea } = Input;
const { Option } = Select;

const PurchaseDocumentView: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const purchaseDocNo = new URLSearchParams(window.location.search).get('DocumentNo');

    const requestLines = useAppSelector(selectPurchaseRequestLines);
    const { PurchaseRequisition, status, error } = useAppSelector(selectPurchaseDocument);

    const { message: approvalRes, status: approvalStatus } = useAppSelector(selectApprovalApplication);
    const { message: cancelApprovalReq, status: cancelApprovalStatus } = useAppSelector(selectCancelApprovalApplication);

    const [form] = Form.useForm();
    const [isHeaderPinned, setIsHeaderPinned] = useState(true);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (purchaseDocNo) {
            dispatch(fetchPurchaseDocument({ documentNo: purchaseDocNo }));
            dispatch(fetchPurchaseRequestLines({ documentNo: purchaseDocNo }));
        }
    }, [dispatch, purchaseDocNo]);


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

            {status === 'pending' ? (
                <Skeleton paragraph={{ rows: 4 }} />
            ) : error ? (
                <Typography.Text type="danger">{error}</Typography.Text>
            ) : (
               <>
               {contextHolder}
             <div style={{ position: 'relative' }}>
                    {approvalStatus === 'loading' || cancelApprovalStatus === 'loading' && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, zIndex: 999,
                            width: '100%', height: '100%',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                        }}>
                            <Spin size="large" tip="Calculating return date... Please wait." />

                        </div>
                    )}
                    
                    <Card style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <EditPurchaseHeader documentNo={purchaseDocNo} purchaseRequisition={PurchaseRequisition.header} />
                        <Divider />
                        <RequestLines documentNo={purchaseDocNo} requestLines={requestLines} purchasePlanItemsList={PurchaseRequisition.procurementPlanItems} />
                    </Card>
                </div>
               </>
            )}

        </div>
    );
};

export default PurchaseDocumentView;
