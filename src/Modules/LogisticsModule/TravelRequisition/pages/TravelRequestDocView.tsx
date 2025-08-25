import React, { useEffect, useState } from 'react';
import {
    Form, Input, DatePicker, Row, Col, Select, Button, Card,
    TimePicker,
    message,
    Spin,
    Typography,
    Tooltip,
    Skeleton,
    Drawer,
    Tag,
    notification,
    Statistic
} from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/PageHeader';
import { fetchDonorsList, fetchJobsList, fetchResponsibilityCenters, selectCommonSetupStatus, selectDonorsList, selectJobsList, selectResponsibilityCenters } from '../../../../features/common/commonSetups';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import moment from 'moment';
import type { TravelRequest } from '../../../../types/logisticsTypes';
import { fetchTravelRequest, fetchTravelRequestList, selectedSubmitTravelRequest, selectedTravelRequest, submitTravelRequest } from '../../../../features/TravelRequest/TravelRequisitions';
import { cancelApproval, selectCancelApprovalApplication } from '../../../../features/common/cancelApprovalReq';
import { selectApprovalApplication, sendForApproval } from '../../../../features/common/sendforApproval';
import { AppstoreAddOutlined, FileTextOutlined } from '@ant-design/icons';
import ApprovalTrailModal from '../../../../components/ApprovalTrailModal';
import { fetchDocuments, selectDocumentsList } from '../../../../features/common/documents';
import DocumentList from '../../../Documents/DocumentList';

const { TextArea } = Input;
const { Option } = Select;
const getTransportModeValue = (mode: string | null): number => {
    switch ((mode || '').toLowerCase()) {
        case 'road':
            return 1;
        case 'air':
            return 2;
        case 'train':
            return 3;
        case 'sea':
            return 4;
        default:
            return 0;
    }
};

const TravelRequestDocView: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const docNumber = new URLSearchParams(window.location.search).get('DocumentNo');
    const [form] = Form.useForm();
    const [isHeaderPinned, setIsHeaderPinned] = useState(true);

    const [transportMode, setTransportMode] = useState<number | null>(null);
    const donorsList = useAppSelector(selectDonorsList);
    const jobsList = useAppSelector(selectJobsList);
    const status = useAppSelector(selectCommonSetupStatus);
    const error = useAppSelector((state) => state.commonSetup.error);
    const submitStatus = useAppSelector(selectedSubmitTravelRequest);
    const { message: approvalRes, status: approvalStatus } = useAppSelector(selectApprovalApplication);
    const { message: cancelApprovalReq, status: cancelApprovalStatus } = useAppSelector(selectCancelApprovalApplication);
    const { travelRequestDoc, status: travelRequestDocStatus } = useAppSelector(selectedTravelRequest);
    const { status: documentStatus, documents } = useAppSelector(selectDocumentsList);
    const responsibilityCenters = useAppSelector(selectResponsibilityCenters);


    const [modalVisible, setModalVisible] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [documentListVisible, setDocumentListVisible] = useState(false);;
    const [api, contextHolder] = notification.useNotification();
    const [totalCost, setTotalCost] = useState<number>(0);

    useEffect(() => {
        if (docNumber && travelRequestDocStatus === 'idle') {
            dispatch(fetchTravelRequest(docNumber));
            dispatch(fetchDonorsList());
            dispatch(fetchJobsList());
            dispatch(fetchResponsibilityCenters());

        }
    }, [dispatch]);

 useEffect(() => {
    if (travelRequestDoc) {
        form.setFieldsValue({
            donorCode: travelRequestDoc.donorCode,
            projectCode: travelRequestDoc.projectCode,
            travelDestination: travelRequestDoc.destination,
            transportMode: getTransportModeValue(travelRequestDoc.modeofTransport),
            flightCost: travelRequestDoc.flightCost,
            airportFees: travelRequestDoc.airportFee,
            visafee: travelRequestDoc.visaFee,
            hotelCost: travelRequestDoc.hotelCost,
            mealCost: travelRequestDoc.mealCost,
            etd: travelRequestDoc.startDate ? moment(travelRequestDoc.startDate) : null,
            deptTime: travelRequestDoc.departTime ? moment(travelRequestDoc.departTime, 'HH:mm:ss') : null,
            etr: travelRequestDoc.returnDate ? moment(travelRequestDoc.returnDate) : null,
            returnTime: travelRequestDoc.returnTime ? moment(travelRequestDoc.returnTime, 'HH:mm:ss') : null,
            days: travelRequestDoc.noofDays,
            perDiemRate: travelRequestDoc.perDiem,
            visitPurpose: travelRequestDoc.purpose,
            responsibilityCenter: travelRequestDoc.responsibilityCenter
        });

        setTransportMode(getTransportModeValue(travelRequestDoc.modeofTransport));

        // ✅ Calculate initial total cost right after setting the values
        calculateTotal({
            hotelCost: travelRequestDoc.hotelCost,
            mealCost: travelRequestDoc.mealCost,
            flightCost: travelRequestDoc.flightCost,
            visafee: travelRequestDoc.visaFee,
            airportFees: travelRequestDoc.airportFee,
            perDiemRate: travelRequestDoc.perDiem,
            days: travelRequestDoc.noofDays
        });
    }
}, [travelRequestDoc]);


    useEffect(() => {
        if (docNumber) {
            dispatch(fetchDocuments({ tableId: 50126, docNo: docNumber }));
        }
    }, [docNumber, dispatch]);

    const handleFileAttachment = () => {
        setIsMobileView((prev) => !prev);
        setDocumentListVisible((prev) => !prev);
    };
    const handleTransportChange = (value: number) => {
        setTransportMode(value);
    };

    const calculateTotal = (values: any) => {
        const {
            hotelCost = 0,
            mealCost = 0,
            flightCost = 0,
            visafee = 0,
            airportFees = 0,
            perDiemRate = 0,
            days = 0
        } = values;

        const perDiemAmount = (Number(perDiemRate) || 0) * (Number(days) || 0);

        const total =
            (Number(hotelCost) || 0) +
            (Number(mealCost) || 0) +
            (Number(flightCost) || 0) +
            (Number(visafee) || 0) +
            (Number(airportFees) || 0) +
            perDiemAmount;

        setTotalCost(total);
    };



    const handleSubmitTravelRequest = async (values: TravelRequest) => {
        const formattedPayload = {
            documentNo: docNumber,
            donorCode: values.donorCode,
            projectCode: values.projectCode,
            startDate: values.etd ? moment(values.etd).format('YYYY-MM-DD') : null,
            endDate: values.etr ? moment(values.etr).format('YYYY-MM-DD') : null,
            deptTime: values.deptTime ? moment(values.deptTime).format('HH:mm:ss') : "",
            returnTime: values.returnTime ? moment(values.returnTime).format('HH:mm:ss') : "",
            travelPurpose: values.visitPurpose || "",
            travelDestination: values.travelDestination,
            transportType: Number(values.transportMode),
            hotelCost: values.hotelCost ?? 0.0,
            mealCost: values.mealCost ?? 0.0,
            flightCost: values.flightCost ?? 0.0,
            visaFee: values.visafee ?? 0.0,
            airportFee: values.airportFees ?? 0.0,
            noOfDays: values.days ?? 0,
            perDiemRate: values.perDiemRate ?? 0,
            perDiemAmount:
                values.perDiemRate && values.days
                    ? values.perDiemRate * values.days
                    : 0,
            responsibilityCenter: values.responsibilityCenter
        };

        await dispatch(submitTravelRequest(formattedPayload))
            .unwrap()
            .then((res) => {
                api.success({
                    message: 'Success',
                    description: `You have successfully updated your travel Request. Your document is ${res?.description}`,
                    duration: 3,

                })
            })
            .catch((error) => {
                api.error({
                    message: 'Error',
                    description: error.message || 'Failed to submit travel request',
                    duration: 3,
                    onClose: () => dispatch({ type: 'RESET' })
                });
            });



    };


    const handleSendForApproval = () => {
        if (!docNumber) return;
        dispatch(
            sendForApproval({
                docNo: docNumber,
                endpoint: `/Logistics/send-approval?documentNo=${docNumber}`
            })
        )
            .unwrap()
            .then((response) => {
                api.success({
                    message: 'Success',
                    description: response.message,
                    duration: 3,
                    onClose: () => {
                        dispatch(fetchTravelRequestList({ documentNo: docNumber }));
                        navigate('/logistics/Travel-Requisition');
                    }
                });
            })
            .catch((error) => {
                api.error({
                    message: 'Error',
                    description: error.message || 'Failed to send for approval',
                    duration: 3,
                    onClose: () => dispatch({ type: 'RESET' })
                });
            });
    };

    const handleCancelApproval = () => {
        if (!docNumber) return;
        dispatch(
            cancelApproval({
                docNo: docNumber,
                endpoint: `/Logistics/cancel-approval?documentNo=${docNumber}`
            })
        )
            .unwrap()
            .then((response) => {
                api.success({
                    message: 'Success',
                    description: response.message,
                    duration: 3,
                    onClose: () => {
                        dispatch(fetchTravelRequestList({ documentNo: docNumber }));
                        navigate('/logistics/Travel-Requisition');
                    }
                });
            })
            .catch((error) => {
                api.error({
                    message: 'Error',
                    description: error.message || 'Failed to cancel approval',
                    duration: 3,
                    onClose: () => dispatch({ type: 'RESET' })
                });
            });
    };



    return (
        <div>
            <PageHeader
                title={`Travel Requisition Form${docNumber ? ` - ${docNumber}` : ''}`}
                isPinned={true}
                onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                onSendForApproval={handleSendForApproval}
                onCancelApproval={handleCancelApproval}
                showActions={true}
            />

            {travelRequestDocStatus === 'pending' ? (
                <Skeleton active paragraph={{ rows: 7 }} />
            ) : (
                <Card style={{ width: '100%' }}>
                    <div style={{ position: 'relative' }}>
                        {submitStatus.status === 'pending' || cancelApprovalStatus === 'loading' || approvalStatus === 'loading' && (
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
                                <Spin size="large" tip="Sending... Please wait." />
                            </div>
                        )}
                        {contextHolder}
                        <Form
                            form={form}
                            layout="vertical"
                            onValuesChange={(_, values) => calculateTotal(values)}
                            onFinish={handleSubmitTravelRequest}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'right',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    width: '100%',
                                }}
                            >

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'right',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    gap: '10px'
                                }}>
                                    {/* <Tooltip title="File Attachment">
                                        <Button type="default" onClick={handleFileAttachment} icon={<FileTextOutlined />}>
                                            File Attachment-<Tag color="red" style={{ marginLeft: 4 }}>{documents.length}</Tag>
                                        </Button>
                                    </Tooltip> */}
                                    <Tooltip title="Approval Trail">
                                        <Button type="default" icon={<AppstoreAddOutlined />} onClick={() => setModalVisible(true)}>
                                            View Approval Trail
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>

                            <Row gutter={18}>

                                <Col span={8}>
                                    <Form.Item label="Donor Code" name="donorCode" rules={[{ required: true }]}>
                                        <Select
                                            showSearch
                                            placeholder="Select Donor Code"
                                            optionFilterProp="children"
                                            filterSort={(optionA, optionB) =>
                                                String(optionA?.children).toLowerCase().localeCompare(String(optionB?.children).toLowerCase())
                                            }
                                        >
                                            <Option value="">-- All Donors --</Option>
                                            {donorsList.map((donor) => (
                                                <Option key={donor.code} value={donor.code}>
                                                    {donor.description}
                                                </Option>
                                            ))}
                                        </Select>

                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Project Code" name="projectCode" rules={[{ required: true }]}>
                                        <Select
                                            showSearch
                                            placeholder="Select Project Code"
                                            optionFilterProp="children"
                                            filterSort={(optionA, optionB) =>
                                                String(optionA?.children).toLowerCase().localeCompare(String(optionB?.children).toLowerCase())
                                            }
                                        >
                                            <Option value="">-- All Projects --</Option>
                                            {jobsList?.map((job) => (
                                                <Option key={job.jobNo} value={job.jobNo}>
                                                    {job.jobDescription}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Travel Destination" name="travelDestination" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Mode of Transport" name="transportMode" rules={[{ required: true }]}>
                                        <Select onChange={handleTransportChange}>
                                            <Option value={0}>-- Select --</Option>
                                            <Option value={1}>Road</Option>
                                            <Option value={2}>Air</Option>
                                            <Option value={3}>Train</Option>
                                            <Option value={4}>Sea</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                {/* Conditional fields for Air travel */}
                                {transportMode === 2 && (
                                    <>
                                        <Col span={8}>
                                            <Form.Item label="Flight Cost" name="flightCost" rules={[{ required: true }]}>
                                                <Input type="number" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item label="Airport Fee" name="airportFees" rules={[{ required: true }]}>
                                                <Input type="number" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item label="Visa Fee" name="visafee" rules={[{ required: true }]}>
                                                <Input type="number" />
                                            </Form.Item>
                                        </Col>
                                    </>
                                )}

                                <Col span={8}>
                                    <Form.Item label="Hotel Cost" name="hotelCost">
                                        <Input type="number" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Meal Cost" name="mealCost">
                                        <Input type="number" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Travel Date" name="etd" rules={[{ required: true }]}>
                                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Departure Time" name="deptTime" rules={[{ required: true }]}>
                                        <TimePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Return Date" name="etr" rules={[{ required: true }]}>
                                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Return Time" name="returnTime" rules={[{ required: true }]}>
                                        <TimePicker style={{ width: '100%' }} />

                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Days of Stay" name="days" rules={[{ required: true }]}>
                                        <Input type="number" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Per Diem Cost" name="perDiemRate">
                                        <Input type="number" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>

                                    <Form.Item label="Responsibility Center" name="responsibilityCenter" rules={[{ required: true }]}>
                                        <Select
                                            showSearch
                                            placeholder="Select Responsibility Center"
                                            optionFilterProp="children"
                                            filterSort={(optionA, optionB) =>
                                                String(optionA?.children).toLowerCase().localeCompare(String(optionB?.children).toLowerCase())
                                            }
                                        >
                                            <Option value="">-- Select --</Option>
                                            {responsibilityCenters?.map((center) => (
                                                <Option key={center.code} value={center.code}>
                                                    {center.description}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>


                                <Col span={24}>
                                    <Form.Item label="Purpose of Visit" name="visitPurpose">
                                        <TextArea rows={4} />
                                    </Form.Item>
                                </Col>
                                <Col span={24} style={{ textAlign: 'right' }}>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            Submit Travel Request
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                        <div style={{ position: 'absolute', bottom: 10, left: 20 }}>
                            <Statistic
                                title="Total Estimated Cost"
                                value={totalCost}
                                precision={2}
                                prefix="$"
                            />
                        </div>
                    </div>
                </Card>
            )}
            <ApprovalTrailModal visible={modalVisible} onClose={() => setModalVisible(false)} />
            {isMobileView && (
                <Drawer
                    title="File Attachment"
                    placement="right"
                    width={800}
                    onClose={handleFileAttachment}
                    visible={documentListVisible}
                >
                    <DocumentList
                        visible={documentListVisible}
                        onClose={() => {
                            setDocumentListVisible(false);
                            setIsMobileView(false);
                        }}
                        documents={documents}

                    />
                </Drawer>
            )}
        </div>
    );
};

export default TravelRequestDocView;
