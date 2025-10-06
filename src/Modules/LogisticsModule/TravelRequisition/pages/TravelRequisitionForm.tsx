import React, { useEffect, useState } from 'react';
import {
    Form, Input, DatePicker, Row, Col, Select, Button, Card,
    TimePicker,
    Spin,
    notification,
    Statistic
} from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/PageHeader';
import {
    fetchDonorsList,
    fetchJobsList,
    selectCommonSetupStatus,
    selectDonorsList,
    selectJobsList,
    selectResponsibilityCenters
} from '../../../../features/common/commonSetups';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import moment from 'moment';
import type { TravelRequest } from '../../../../types/logisticsTypes';
import { fetchTravelRequestList, selectedSubmitTravelRequest, submitTravelRequest } from '../../../../features/TravelRequest/TravelRequisitions';
import { cancelApproval, selectCancelApprovalApplication } from '../../../../features/common/cancelApprovalReq';
import { selectApprovalApplication, sendForApproval } from '../../../../features/common/sendforApproval';

const { TextArea } = Input;
const { Option } = Select;

const TravelRequisitionForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [transportMode, setTransportMode] = useState<number | null>(null);
    const donorsList = useAppSelector(selectDonorsList);
    const jobsList = useAppSelector(selectJobsList);
    const responsibilityCenters = useAppSelector(selectResponsibilityCenters);
    const submitStatus = useAppSelector(selectedSubmitTravelRequest);
    const { status: approvalStatus } = useAppSelector(selectApprovalApplication);
    const { status: cancelApprovalStatus } = useAppSelector(selectCancelApprovalApplication);
    const [docNumber, setDocNumber] = useState<string>('');
    const [api, contextHolder] = notification.useNotification();
    const [totalCost, setTotalCost] = useState<number>(0);

    useEffect(() => {
        dispatch(fetchDonorsList());
        dispatch(fetchJobsList());
    }, [dispatch]);

    const handleTransportChange = (value: number) => {
        setTransportMode(value);
    };

    useEffect(() => {
        const unsubscribe = form.subscribe?.(({ values }) => {
            calculateTotal(values);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [form]);

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
        try {
            const formattedPayload = {
                documentNo: "",
                donorCode: values.donorCode,
                projectCode: values.projectCode,
                startDate: values.etd ? moment(values.etd).format('YYYY-MM-DD') : null,
                endDate: values.etr ? moment(values.etr).format('YYYY-MM-DD') : null,
                deptTime: values.deptTime ? moment(values.deptTime).format('HH:mm:ss') : "",
                returnTime: values.returnTime ? moment(values.returnTime).format('HH:mm:ss') : "",
                travelPurpose: values.visitPurpose ?? "",
                travelDestination: values.travelDestination ?? "",
                transportType: Number(values.transportMode) || 0,
                hotelCost: values.hotelCost ?? 0.0,
                mealCost: values.mealCost ?? 0.0,
                flightCost: values.flightCost ?? 0.0,
                visaFee: values.visafee ?? 0.0,
                airportFee: values.airportFees ?? 0.0,
                noOfDays: values.days ?? 0,
                perDiemRate: values.perDiemRate ?? 0,
                perDiemAmount: (values.perDiemRate ?? 0) * (values.days ?? 0),
                responsibilityCenter: values.responsibilityCenter ?? ""
            };

            const res = await dispatch(submitTravelRequest(formattedPayload));

            if (submitTravelRequest.fulfilled.match(res)) {
                const docNumberFromAPI = res.payload.description;
                setDocNumber(docNumberFromAPI);
                const params = new URLSearchParams();
                params.set('DocumentNo', docNumberFromAPI);
                navigate(`?${params.toString()}`, { replace: true });
                api.success({
                    message: 'Success',
                    description: `You have successfully initiated a travel request. Your document number is ${docNumberFromAPI}`,
                    duration: 3,
                });
            } else {
                api.error({
                    message: 'Error',
                    description: res.error?.message || 'Failed to submit travel request',
                    duration: 3
                });
            }
        } catch (error: any) {
            api.error({
                message: 'Unexpected Error',
                description: error.message || 'Something went wrong while submitting travel request',
                duration: 3,
            });
        }
    };
   const handleSendForApproval = () => {
        if (!docNumber) return;

        dispatch(
            sendForApproval({
                docNo: docNumber,
                endpoint: `/Logistics/send-approval?documentNo=${docNumber}`,
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
                endpoint: `/Logistics/cancel-approval?documentNo=${docNumber}`,
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
        </div>
    );
};

export default TravelRequisitionForm;
