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

import PageHeader from '../../../../components/PageHeader';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import TravelAdvanceHeader from '../partials/TravelAdvanceHeader';
import EditAdvanceHeader from '../partials/EditAdvanceHeader';
import AdvanceRequestLines from '../partials/AdvanceRequestLines';
import { selectApprovalApplication, sendForApproval } from '../../../../features/common/sendforApproval';
import { cancelApproval, selectCancelApprovalApplication } from '../../../../features/common/cancelApprovalReq';
import { fetchAdvanceRequestList, fetchImprestDocument, fetchImprestLine, selectImprestDocument, selectImprestLines } from '../../../../features/finance/advanceRequisition';


const { TextArea } = Input;
const { Option } = Select;

const TravelAdvanceRequisition: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const initialdocNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const [docNo, setDocNo] = React.useState<string | null>(initialdocNo);

    const { imprestDocument, status } = useAppSelector(selectImprestDocument);
    const { imprestLines, status: lineStatus } = useAppSelector(selectImprestLines);

    const { message: approvalRes, status: approvalStatus } = useAppSelector(selectApprovalApplication);
    const { message: cancelApprovalReq, status: cancelApprovalStatus } = useAppSelector(selectCancelApprovalApplication);

    const [form] = Form.useForm();
    const [isHeaderPinned, setIsHeaderPinned] = React.useState(true);

    const [api, contextHolder] = notification.useNotification();


    useEffect(() => {
        if (docNo) {
            dispatch(fetchImprestDocument({ documentNo: docNo }));
           dispatch(fetchImprestLine({ documentNo: docNo }));
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
         dispatch(fetchImprestDocument({ documentNo: docNo }));
           dispatch(fetchImprestLine({ documentNo: docNo }));
    };

    const handleSendForApproval = () => {
        if (!docNo) return;

        // Show loading notification
        const hide = message.loading('Sending for approval...', 0);

        dispatch(
            sendForApproval({
                docNo,
                endpoint: `/Finance/send-approval?docNo=${docNo}`,
            })
        )
            .unwrap()
            .then((response) => {
                hide(); // Remove loading message
                api.success({
                    message: 'Success',
                    description: response.message,
                    duration: 3,
                    onClose: () => {
                        navigate('/finance/Travel-advance-list');
                        dispatch(fetchAdvanceRequestList());

                    },
                });
            })
            .catch((error) => {
                hide();
                api.error({
                    message: 'Error',
                    description: error?.message || 'Failed to send for approval',
                    duration: 3,
                });
            });
    };

    const handleCancelApproval = () => {
        if (!docNo) return;

        const hide = message.loading('Cancelling approval...', 0);

        dispatch(
            cancelApproval({
                docNo,
                endpoint: `/Finance/cancel-approval?docNo=${docNo}`,
            })
        )
            .unwrap()
            .then((response) => {
                hide();
                api.success({
                    message: 'Success',
                    description: response.message,
                    duration: 3,
                    onClose: () => {
                        navigate('/finance/Travel-advance-list');
                        dispatch(fetchAdvanceRequestList());

                    },
                });
            })
            .catch((error) => {
                hide();
                api.error({
                    message: 'Error',
                    description: error?.message || 'Failed to cancel approval',
                    duration: 3,
                });
            });
    };

    return (
        <div >
            <PageHeader
                title="Travel Advance Requisition"
                isPinned={isHeaderPinned}
                onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                showActions={true}
                onSendForApproval={handleSendForApproval}
                onCancelApproval={handleCancelApproval}
            />
            {status === 'pending' ? (
                <Skeleton paragraph={{ rows: 4 }} />
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
                            {docNo ? (
                                <EditAdvanceHeader documentNumber={docNo} paymentData={imprestDocument} />
                            ) : (
                                <TravelAdvanceHeader onSubmit={handleHeaderSubmit} />
                            )}
                            <Divider />

                            {docNo && (
                                <>
                                    {lineStatus === 'pending' ? (
                                        <Skeleton paragraph={{ rows: 4 }} />
                                    ) : (
                                        <AdvanceRequestLines
                                            documentStatus={imprestDocument?.status}
                                            requestLines={imprestLines}
                                           listOfExpenditureTypes={imprestDocument?.listOfExpenditureTypes}
                                            documentDetails={imprestDocument}

                                        />
                                    )}
                                </>
                            )}
                        </Card>

                    </div>

                </>
            )}
        </div>
    );
};

export default TravelAdvanceRequisition;
