// src/features/requisition/StoreRequisitionForm.tsx
import React, { useEffect } from 'react';
import {
    Form,
    Card,
    Divider,
    notification,
    Spin,
} from 'antd';
import { useNavigate } from 'react-router-dom';

import RequisitionHeader from './partials/RequisitionHeader';
import EditRequisitionHeader from './partials/EditRequisitionHeader';
import PageHeader from '../../components/PageHeader';
import RequestLines from './partials/RequestLines';
import { useAppDispatch, useAppSelector } from '../../hooks/ReduxHooks';
import {
    fetchStoreReqDropDowns,
    fetchStoreRequestDocument,
    fetchStoreRequestLines,
    fetchStoreRequisitions,
    selectStoreReqDropDowns,
    selectStoreRequest,
} from '../../features/storeRequisitions/storeRequests';
import { selectApprovalApplication, sendForApproval } from '../../features/common/sendforApproval';
import { cancelApproval, selectCancelApprovalApplication } from '../../features/common/cancelApprovalReq';

const StoreRequisitionForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [isHeaderPinned, setIsHeaderPinned] = React.useState(true);
    const [api, contextHolder] = notification.useNotification();
    // Get docNo from query string
    const initialDocNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const [docNo, setDocNo] = React.useState<string | null>(initialDocNo);

    const { status, requestHeader, requestLines, error } =
        useAppSelector(selectStoreRequest);
    const { message: approvalRes, status: approvalStatus } = useAppSelector(selectApprovalApplication);
    const { message: cancelApprovalReq, status: cancelApprovalStatus } = useAppSelector(selectCancelApprovalApplication);
    const {issuingStoreSetup}= useAppSelector(selectStoreReqDropDowns);


useEffect(() => {
    dispatch(fetchStoreReqDropDowns());
}, [dispatch]);

    useEffect(() => {
        if (docNo) {
            // Editing existing requisition
            dispatch(fetchStoreRequestDocument({ documentNo: docNo }));
            dispatch(fetchStoreRequestLines({ documentNo: docNo }));
        }
    }, [dispatch, docNo]);


    const handleSendForApproval = () => {
        if (!docNo) return;


        dispatch(
            sendForApproval({
                docNo,
                endpoint: `/Procurement/send-Store-approval?docNo=${docNo}`,
            })
        )
            .unwrap()
            .then((response) => {
                api.success({
                    message: 'Success',
                    description: response.message,
                    duration: 3,
                    onClose: () => {
                        navigate('/procurement/store-requisition');
                        dispatch(fetchStoreRequisitions());

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
        if (!docNo) return;


        dispatch(
            cancelApproval({
                docNo,
                endpoint: `/Procurement/cancel-store-approval?docNo=${docNo}`,
            })
        )
            .unwrap()
            .then((response) => {
                api.success({
                    message: 'Success',
                    description: response.message,
                    duration: 3,
                    onClose: () => {
                        navigate('/procurement/store-requisition');
                        dispatch(fetchStoreRequisitions());

                    },
                });
            })
            .catch((error) => {
                api.error({
                    message: 'Error',
                    description: error?.message || 'Failed to cancel approval',
                    duration: 3,
                });
            });
    };

    return (
        <div>
            <PageHeader
                title="Store Requisition"
                isPinned={isHeaderPinned}
                onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                showActions={true}
                onSendForApproval={handleSendForApproval}
                onCancelApproval={handleCancelApproval}
            />
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
                    <Card
                        style={{
                            width: '100%',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* ✅ Correct logic: if docNo exists, edit; else, create */}
                        {docNo ? (
                            <EditRequisitionHeader requestHeader={requestHeader} />
                        ) : (
                            <RequisitionHeader
                                onSubmit={(newDocNo) => setDocNo(newDocNo)}
                                issuingStoreSetup={issuingStoreSetup}
                            />
                        )}

                        <Divider />

                        {/* Only show lines if editing existing request */}
                        {docNo && (
                            <RequestLines requestLines={requestLines} documentNo={docNo} />
                        )}
                    </Card>
                </div>

            </>
        </div>
    );
};

export default StoreRequisitionForm;
