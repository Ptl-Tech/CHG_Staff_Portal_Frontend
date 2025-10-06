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
    Skeleton,
    Spin,
    message,
    Tag,
    Modal,
    Drawer,
    Alert,
    notification,
} from 'antd';
import {
    AppstoreAddOutlined,
    CalendarOutlined,
    FileTextOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import ApprovalTrailModal from '../../../../components/ApprovalTrailModal';
import PageHeader from '../../../../components/PageHeader';
import type { LeaveApplication } from '../../../../types/leave';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import { fetchLeaveDropdownData, selectDropdowns } from '../../../../features/leaveApplication/leaveConstantsSlice';
import { fetchReturnDates, selectReturnDates } from '../../../../features/leaveApplication/fetchLeaveReturnDates';
import { fetchLeaveDocument, selectLeaveDocument } from '../../../../features/leaveApplication/fetchLeaveDocument';
import { selectLeaveApplication, submitLeaveApplication } from '../../../../features/leaveApplication/leaveApplicationSlice';
import { selectApprovalApplication, sendForApproval } from '../../../../features/common/sendforApproval';
import { cancelApproval, selectCancelApprovalApplication } from '../../../../features/common/cancelApprovalReq';
import { fetchLeaves } from '../../../../features/leaveApplication/leaveListSlice';
import DocumentList from '../../../Documents/DocumentList';
import { fetchDocuments, selectDocumentsList } from '../../../../features/common/documents';
import type { AlertInfo } from '../../../../types/dropdown';

const { TextArea } = Input;
const { Option } = Select;

const LeaveDocumentView: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const leaveNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const isEditMode = Boolean(leaveNo);

    const { leave: leaveData, status: leaveStatus, error: leaveError } = useAppSelector(selectLeaveDocument);
    const { leaveTypes, relievers, responsibilityCenters, status, error } = useAppSelector(selectDropdowns);

    const { data: returnData, status: returnStatus } = useAppSelector(selectReturnDates);
    const { data: res, status: resStatus } = useAppSelector(selectLeaveApplication);

    const { message: approvalRes, status: approvalStatus } = useAppSelector(selectApprovalApplication);
    const { message: cancelApprovalReq, status: cancelApprovalStatus } = useAppSelector(selectCancelApprovalApplication);

    const { status: documentStatus, documents } = useAppSelector(selectDocumentsList);


    const [form] = Form.useForm();
    const [isHeaderPinned, setIsHeaderPinned] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [documentListVisible, setDocumentListVisible] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [documentCount, setDocumentCount] = useState(0);
    const [alertInfor, setAlertInfor] = React.useState<AlertInfo>(null);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (leaveNo) {
            dispatch(fetchLeaveDocument({ leaveNo }));
            dispatch(fetchLeaveDropdownData());
        } else {
            form.resetFields();
        }
    }, [leaveNo, dispatch, form]);
     useEffect(() => {
        if (isEditMode && leaveData && relievers.length > 0) {

            //normalize the reliever code
            const relieverCode= relievers.find((reliever) => reliever.description === leaveData.reliever)?.code;



            form.setFieldsValue({
                ...leaveData,
                leaveType: leaveData.leaveType,
                purpose: leaveData.remarks,
                startDate: leaveData.startDate ? moment(leaveData.startDate, "YYYY-MM-DD") : null,
                endDate: leaveData.endDate ? moment(leaveData.endDate, "YYYY-MM-DD") : null,
                returnDate: leaveData.returnDate ? moment(leaveData.returnDate, "YYYY-MM-DD").format("DD/MM/YYYY") : null,
                days: leaveData.leaveDays,
                responsibilityCenter: leaveData.responsibilityCenter,
                reliever: relieverCode || null,
                remarks: leaveData.remarks,
            });
        }
    }, [isEditMode, leaveData, form, relievers]);



    useEffect(() => {
        if (leaveTypes.length === 0 || relievers.length === 0) {
            dispatch(fetchLeaveDropdownData());
        }
    }, [dispatch, leaveTypes.length, relievers.length, responsibilityCenters.length]);


    // useEffect(() => {
    //     if (leaveNo) {
    //         dispatch(fetchDocuments({ tableId: 50215, docNo: leaveNo }));
    //     }
    // }, [leaveNo, dispatch]);
    const getReturnDate = async (values: any) => {
        const { leaveType, startDate, endDate } = values;
        if (!leaveType || !startDate) return;
        const payload = {
            leaveNo: leaveNo,
            leaveType,
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            //  leaveDays: Number(days),
        };

        try {
            const data = await dispatch(fetchReturnDates(payload)).unwrap();
            form.setFieldsValue({
                returnDate: data.returnDate ? moment(data.returnDate, "MM/DD/YY").format("DD/MM/YYYY") : null,
                endDate: data.endDate ? moment(data.endDate, "MM/DD/YY") : null,
                days: data.leaveDays,
                leaveNo: data.leaveNo,
            });




        } catch (err: any) {
            form.setFieldsValue({ returnDate: null, endDate: null, leaveNo: null });
            setAlertInfor({ message: err?.message, type: 'error' })
            api.error({
                message: 'Error',
                description: err?.message || 'Error fetching return date',
                style: {
                    // backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    color: '#fff',
                    fontWeight: 'semibold'
                },
                duration: 5,
                onClose: () => {
                    dispatch({ type: 'RESET' });
                }
            })
        }
    };

    const handleFinish = async (values: any) => {
        console.log('values', values);
        const payload: LeaveApplication = {
            ...values,
            leaveNo,
            reliever: values.reliever ?? leaveData?.reliever ?? null,
            startDate: values.startDate.format('YYYY-MM-DD'),
            endDate: values.endDate.format('YYYY-MM-DD'),
            returnDate: moment(values.returnDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
            leaveDays: Number(values.days),
            remarks: values.purpose,
        };

        try {
            const res = await dispatch(submitLeaveApplication(payload)).unwrap();


            setAlertInfor({ message: res.responseDTO?.description, type: 'success' })
            api.success({
                message: res.responseDTO?.description,
                // placement: 'bottomRight',
            });
            form.setFieldsValue({
                leaveNo: res.leaveNo,

                //extract the date     "returnDate": "08/28/25##3",

                returnDate: res.returnDate ? moment(res.returnDate, "MM/DD/YY").format("DD/MM/YYYY") : null,
                endDate: res.endDate ? moment(res.endDate) : null,
            });
        } catch (err: any) {
            setAlertInfor({ message: err?.message, type: 'error' })

            api.error({
                message: err?.message,
                // placement: 'bottomRight',
            });

        }
    };


    const handleSendForApproval = () => {
        if (!leaveNo) return;

        dispatch(
            sendForApproval({
                docNo: leaveNo,
                endpoint: `/Leave/send-approval?leaveNo=${leaveNo}`, // use `leaveNo` not `docNo`
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
                        dispatch(fetchLeaves());
                        navigate('/Leave Application/Leave-List');
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
        if (!leaveNo) return;

        dispatch(
            cancelApproval({
                docNo: leaveNo,
                endpoint: `/Leave/cancel-approval?leaveNo=${leaveNo}`, // use `leaveNo` not `docNo`
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

                        dispatch(fetchLeaves());

                        navigate('/Leave Application/Leave-List');
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

    // Handle file attachment toggle
    const handleFileAttachment = () => {
        setIsMobileView((prev) => !prev);
        setDocumentListVisible((prev) => !prev);
    };


    const commonProps = { readOnly: isReadOnly };

    return (
        <div>
            <PageHeader
                title=""
                isPinned={isHeaderPinned}
                onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                showActions={true}
                onSendForApproval={handleSendForApproval}
                onCancelApproval={handleCancelApproval}
            />

            <Card>
                {leaveStatus === 'pending' ? (
                    <Skeleton active paragraph={{ rows: 10 }} />
                ) : error ? (
                    <Typography.Text type="danger">{error}</Typography.Text>
                ) : (
                    <div style={{ position: 'relative' }}>
                        {(returnStatus === 'pending' ||
                            resStatus === 'pending' ||
                            approvalStatus === 'loading' ||
                            cancelApprovalStatus === 'loading') && (
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
                                    <Spin
                                        size="large"
                                        tip="Processing request... Please wait."
                                    />
                                </div>
                            )}

                        {contextHolder}
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFinish}
                            autoComplete="off"
                            onValuesChange={(changedValues, allValues) => {
                                if (changedValues.leaveType || changedValues.startDate || changedValues.endDate) {
                                    getReturnDate(allValues);
                                }
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    gap: '16px'
                                }}
                            >
                                <Typography.Text strong >Leave Application Form-{leaveNo}</Typography.Text>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* <Tooltip title="File Attachment">
                                        <Button type="default" onClick={handleFileAttachment} icon={<FileTextOutlined />}>
                                            File Attachment-<Tag color="red" style={{ marginLeft: 4 }}>{documents.length}</Tag>
                                        </Button>
                                    </Tooltip> */}

                                    <Tooltip title="Approval Trail">
                                        <Button type="dashed" icon={<AppstoreAddOutlined />} onClick={() => setModalVisible(true)}>
                                            View Approval Trail
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={isReadOnly ? 'Edit Form' : 'Disable Editing'}>
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            onClick={() => setIsReadOnly((prev) => !prev)}
                                        >
                                            {isReadOnly ? 'Edit' : 'Disable Edit'}
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Leave Type"
                                                name="leaveType"
                                                rules={[{ required: true, message: 'Please select a leave type' }]}
                                            >
                                                <Select placeholder="Select Leave Type" style={{ width: '100%', color: 'black', fontWeight: 'bold' }} {...commonProps}>
                                                    {leaveTypes.map((type) => (
                                                        <Option key={type.code} value={type.code}>
                                                            {type.description}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item label="Reliever" name="reliever" rules={[{ required: true, message: 'Please select a reliever' }]}>
                                                <Select
                                                    placeholder="Select Reliever"
                                                    style={{ width: '100%' }}
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="children"
                                                    {...commonProps}
                                                >
                                                    {relievers.map((reliever) => (
                                                        <Option key={reliever.code} value={reliever.code}>
                                                            {reliever.description}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item
                                                label="Start Date"
                                                name="startDate"
                                                rules={[{ required: true, message: 'Please select a start date' }]}
                                            >
                                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} suffixIcon={<CalendarOutlined />} {...commonProps} disabledDate={(current) => current && current < moment().startOf('day')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="End Date"
                                                name="endDate"
                                                rules={[{ required: true, message: 'Please select an end date' }]}
                                            >
                                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} suffixIcon={<CalendarOutlined />} disabledDate={(current) => current && current < moment().startOf('day')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="No of Days"
                                                name="days"
                                                rules={[{ required: true, message: 'Please input number of days' }]}
                                            >
                                                <Input type="number" readOnly style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>



                                        <Col span={12}>
                                            <Form.Item
                                                label="Return Date"
                                                name="returnDate"
                                                rules={[{ required: true, message: 'Return date is required' }]}
                                            >
                                                <Input readOnly style={{ width: '100%' }} />
                                            </Form.Item>

                                        </Col>


                                        <Col span={24}>
                                            <Form.Item
                                                label="Purpose of Leave"
                                                name="purpose"
                                            >
                                                <TextArea rows={3} placeholder="Reason for applying leave" {...commonProps} />
                                            </Form.Item>
                                        </Col>

                                        {!isReadOnly && (
                                            <Col span={24} style={{ textAlign: 'right' }}>
                                                <Form.Item>
                                                    <Button type="primary" htmlType="submit">
                                                        Submit Leave Application
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        )}
                                    </Row>
                                </Col>
                                {isMobileView && (
                                    <Drawer
                                        title="File Attachment"
                                        placement="right"
                                        width={800}
                                        onClose={handleFileAttachment}
                                        visible={documentListVisible}
                                    >
                                        {/* <DocumentList
                                            visible={documentListVisible}
                                            onClose={() => {
                                                setDocumentListVisible(false);
                                                setIsMobileView(false);
                                            }}
                                            documents={documents}
                                            tableId={50215}
                                            docNo={leaveNo}

                                        /> */}
                                    </Drawer>
                                )}
                            </Row>
                        </Form>
                    </div>
                )}
            </Card>

            <ApprovalTrailModal visible={modalVisible} onClose={() => setModalVisible(false)} />

        </div>
    );
};

export default LeaveDocumentView;
