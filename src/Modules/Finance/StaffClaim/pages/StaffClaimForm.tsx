// src/features/leave/LeaveApplicationForm.tsx
import React, { useEffect } from 'react';
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
    notification,
    Spin
} from 'antd';
import {
    CalendarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import StaffClaimHeader from '../partials/staffClaimHeader';
import PageHeader from '../../../../components/PageHeader';
import EditStaffClaimHeader from '../partials/EditStaffClaimHeader';
import { fetchPaymentDocument, fetchPaymentDocumentLines, selectPaymentDocument, selectPaymentLines } from '../../../../features/finance/commonRequest';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import StaffClaimRequestLines from '../partials/StaffClaimRequestLines';
import { selectApprovalApplication, sendForApproval } from '../../../../features/common/sendforApproval';
import { cancelApproval, selectCancelApprovalApplication } from '../../../../features/common/cancelApprovalReq';

const { TextArea } = Input;
const { Option } = Select;

const StaffClaimForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();


    const initialdocNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const [docNo, setDocNo] = React.useState<string | null>(initialdocNo);
    const { document, status, error } = useAppSelector(selectPaymentDocument);
    const { documentLines, status: lineStatus, error: lineError } = useAppSelector(selectPaymentLines);

    const { message: approvalRes, status: approvalStatus } = useAppSelector(selectApprovalApplication);
    const { message: cancelApprovalReq, status: cancelApprovalStatus } = useAppSelector(selectCancelApprovalApplication);

    const [isHeaderPinned, setIsHeaderPinned] = React.useState(true);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (docNo) {
            dispatch(fetchPaymentDocument({ documentNo: docNo }));
            dispatch(fetchPaymentDocumentLines({ documentNo: docNo }));
        }
    }, [dispatch, docNo]);

    useEffect(() => {
        if (docNo) {
            const params = new URLSearchParams();
            params.set('DocumentNo', docNo);
            navigate(`?${params.toString()}`, { replace: true });
        }
    }, [docNo]);

    const handleHeaderSubmit = (newDocNo: string) => {
        setDocNo(newDocNo);
        dispatch(fetchPaymentDocument({ documentNo: docNo }));
        dispatch(fetchPaymentDocumentLines({ documentNo: docNo }));
    };



    const handleSendForApproval = () => {
        if (!docNo) return;
        dispatch(
            sendForApproval({
                docNo: docNo,
                endpoint: `/Finance/send-approval?docNo=${docNo}`, // use `leaveNo` not `docNo`
            })
        )
            .unwrap()
            .then((response) => {
                api.success({
                    message: 'Success',
                    description: response.message,
                    style: {
                        // backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                        color: '#fff',
                        fontWeight: 'semibold'
                    },
                    duration: 3,
                    onClose: () => {
                        dispatch(fetchPaymentDocumentLines({ documentNo: docNo }));
                        navigate('/finance/Staff-Claim-list');
                    }
                });

            })
            .catch((error) => {
                api.error({
                    message: 'Error',
                    description: error.message || 'Failed to send for approval',
                    style: {
                        // backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f',
                        color: '#fff',
                        fontWeight: 'semibold'
                    },
                    duration: 3,
                    onClose: () => {
                        dispatch({ type: 'RESET' });
                    }
                })
            });
    };

    const handleCancelApproval = () => {
        if (!docNo) return;
        dispatch(
            cancelApproval({
                docNo: docNo,
                endpoint: `/Finance/cancel-approval?docNo=${docNo}`, // use `leaveNo` not `docNo`
            })
        )
            .unwrap()
            .then((response) => {
                api.success({
                    message: 'Success',
                    description: response.message,
                    style: {
                        // backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                        color: '#fff',
                        fontWeight: 'semibold'
                    },
                    duration: 3,
                    onClose: () => {

                        dispatch(fetchPaymentDocumentLines({ documentNo: docNo }));
                        navigate('/finance/Staff-Claim-list');
                    }
                });
            })
            .catch((error) => {
                api.error({
                    message: 'Error',
                    description: error.message || 'Failed to cancel approval',
                    style: {
                        // backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f',
                        color: '#fff',
                        fontWeight: 'semibold'
                    },
                    duration: 3,
                    onClose: () => {
                        dispatch({ type: 'RESET' });
                    }
                })
            });
    };


    return (
        <div >
            <PageHeader
                title="Staff Claim Form"
                isPinned={isHeaderPinned}
                onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                showActions={true}
                onSendForApproval={handleSendForApproval}
                onCancelApproval={handleCancelApproval}
            />
            {status === 'pending' ? (
                <Skeleton paragraph={{ rows: 4 }} />
            ) : (
                <div style={{ position: 'relative' }}>
                    {approvalStatus === 'loading' || cancelApprovalStatus === 'loading' && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 999,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Spin size="large" tip="Processing... Please wait." />
                        </div>
                    )}


                    {contextHolder}
                    <Card style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {docNo ? (
                            <EditStaffClaimHeader documentNumber={docNo} paymentData={document} />
                        ) : (
                            <StaffClaimHeader onSubmit={handleHeaderSubmit} />
                        )}
                        <Divider />

                        {docNo && <>
                            {lineStatus === 'pending' ? (
                                <Skeleton paragraph={{ rows: 4 }} />
                            ) : lineError ? (
                                <Typography.Text type="danger">{lineError}</Typography.Text>
                            ) : (
                                <StaffClaimRequestLines documentStatus={document?.status} requestLines={documentLines}
                                    listOfClaimLineTypes={document?.listOfClaimLineTypes}
                                    listOfActivities={document?.listOfActivities || []}
                                    listofProjectCodes={document?.listOfProjectCodes || []}
                                />
                            )}
                        </>}
                    </Card>
                </div>


            )}
        </div>
    );
};

export default StaffClaimForm;
