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
import { fetchPaymentDocument, fetchSurrenderLines, selectPaymentDocument, selectSurrenderLines } from '../../../../features/finance/commonRequest';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import EditSurrenderHeader from '../partials/EditSurrenderHeader';
import AdvanceSurrenderRequestLines from '../partials/AdvanceSurrenderRequestLines';
import { selectApprovalApplication, sendForApproval } from '../../../../features/common/sendforApproval';
import { cancelApproval, selectCancelApprovalApplication } from '../../../../features/common/cancelApprovalReq';
import { fetchAdvanceSurrenderList } from '../../../../features/finance/advanceSurrender';

const { TextArea } = Input;
const { Option } = Select;

const TravelAdvanceSurrenderForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const docNo = new URLSearchParams(window.location.search).get('DocumentNo');

    const [form] = Form.useForm();
    const [isHeaderPinned, setIsHeaderPinned] = React.useState(true);
    const [api, contextHolder] = notification.useNotification();

    const { document, status, error } = useAppSelector(selectPaymentDocument);
    const { surrenderLines, status: lineStatus, error: lineError } = useAppSelector(selectSurrenderLines);


    const { message: approvalRes, status: approvalStatus } = useAppSelector(selectApprovalApplication);
    const { message: cancelApprovalReq, status: cancelApprovalStatus } = useAppSelector(selectCancelApprovalApplication);


    useEffect(() => {
        if (docNo) {
            dispatch(fetchPaymentDocument({ documentNo: docNo }));
            dispatch(fetchSurrenderLines({ documentNo: docNo }));
        }
    }, [dispatch, docNo]);



    const handleSendForApproval = () => {
        if (!docNo) return;
        dispatch(
            sendForApproval({
                docNo: docNo,
                endpoint: `/Finance/cancel-surrender-approval?docNo=${docNo}`,
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
                        dispatch(fetchAdvanceSurrenderList());
                        navigate('/finance/Advance-surrender-list');
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
                endpoint: `/Finance/send-surrender-approval?docNo=${docNo}`, 
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

                        dispatch(fetchAdvanceSurrenderList());

                        navigate('/finance/Advance-surrender-list');
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
                title="Advance Surrender Form"
                isPinned={isHeaderPinned}
                onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                showActions={true}
                onSendForApproval={handleSendForApproval}
                onCancelApproval={handleCancelApproval}
            />
            {status === 'pending' ? (
                <Skeleton paragraph={{ rows: 4 }} />
            ) : error ? (
                <Typography.Text>{error}</Typography.Text>
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
                            <Spin size="large" tip="Calculating return date... Please wait." />
                        </div>
                    )}


                    {contextHolder}
                    <Card style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <EditSurrenderHeader paymentNo={docNo} paymentData={document} />
                        <Divider />

                        {docNo && (
                            <>

                                {lineStatus === 'pending' ? (
                                    <Skeleton paragraph={{ rows: 4 }} />
                                ) : lineError ? (
                                    <Typography.Text type="danger">{lineError}</Typography.Text>
                                ) : (
                                    <AdvanceSurrenderRequestLines documentStatus={document?.status} requestLines={surrenderLines} />
                                )}
                            </>
                        )}
                    </Card>
                </div>


            )}
        </div>
    );
};

export default TravelAdvanceSurrenderForm;
