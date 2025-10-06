import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    DatePicker,
    TimePicker,
    Row,
    Col,
    Select,
    Button,
    Card,
    notification,
    Spin
} from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/PageHeader';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import {
    fetchEmployeeList,
    selectStaffList
} from '../../../../features/common/commonSetups';
import type { VehicleRequest } from '../../../../types/VehicleRequest';
import moment from 'moment';
import {
    fetchVehicleRequest,
    selectSubmitVehicleRequest,
    selectVehicleRequest,
    submitVehicleRequest
} from '../../../../features/vehicleRequests/VehicleRequisitions';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Option } = Select;

const VehicleRequestForm: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const staffList = useAppSelector(selectStaffList);
    const documentNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const [api, contextHolder] = notification.useNotification();

    const { document, status } = useAppSelector(selectVehicleRequest);
    const {status: submitStatus, vehicleRequestResponse, error} = useAppSelector(selectSubmitVehicleRequest);

    const [isHeaderPinned, setIsHeaderPinned] = useState(true);
    const [docNumber, setDocNumber] = useState<string | null>(null);

    useEffect(() => {
        if (documentNo) {
            dispatch(fetchVehicleRequest(documentNo));
        }
    }, [dispatch, documentNo]);

    useEffect(() => {
        if (document) {
            form.setFieldsValue({
                documentNo: document.documentNo,
                requestDate: document.requestDate ? moment(document.requestDate) : null,
                requestor: document.requestor, 
                etd: document.deptTime ? moment(document.deptTime, 'HH:mm:ss') : null,
                etr: document.returnTime ? moment(document.returnTime, 'HH:mm:ss') : null,
                travelDestination: document.travelDestination,
                tripAuthorizor: document.tripAuthorizor,
                visitPurpose: document.visitPurpose,
                carNumber: document.carNumber,
                carRegNo: document.carRegNo,
                carType: document.carType,
                driver: document.driver,
                startingKm: document.startingKm,
                finalKm: document.finalKm,
                descriptionReasonofTrip: document.descriptionReasonofTrip
            });
        }
    }, [form, document]);

    useEffect(() => {
        dispatch(fetchEmployeeList());
    }, [dispatch]);

    const handleFinish = async (values: any) => {
        const payload = {
            ...values,
            documentNo:documentNo || '',
            requestor: values.requestor || document.requestor,
            tripAuthorizor: values.tripAuthorizor || document.tripAuthorizor,
            requestDate: values.requestDate
                ? moment(values.requestDate).format('YYYY-MM-DD')
                : null,
            deptTime: values.etd ? moment(values.etd).format('HH:mm:ss') : null,
            returnTime: values.etr ? moment(values.etr).format('HH:mm:ss') : null
        };

        console.log('Form Data:', payload);

        const res = await dispatch(submitVehicleRequest(payload));

        if (submitVehicleRequest.fulfilled.match(res)) {
            const docNumberFromAPI = res.payload.description;
            setDocNumber(docNumberFromAPI);
            const params = new URLSearchParams();
            params.set('DocumentNo', docNumberFromAPI);
            navigate(`?${params.toString()}`, { replace: true });
            api.success({
                message: 'Success',
                description: `Your vehicle request has been saved. Your document number is ${docNumberFromAPI}`,
                duration: 3,
                onClose() {
            dispatch(fetchVehicleRequest(docNumberFromAPI));
                },
            });
        } else {
            api.error({
                message: 'Error',
                description: res.error?.message || 'Failed to submit travel request',
                duration: 3
            });
        }
    };



    return (
        <div>
           
            <Card title="Vehicle Request Form" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }} extra={
                <Button type='link' icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
            }>
                <div style={{ position: 'relative' }}>
                    {submitStatus === 'pending' && (
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
                        onFinish={handleFinish}
                    >
                        <Row gutter={18}>
                            <Col span={12}>
                                <Form.Item
                                    name="requestDate"
                                    label="Request Date"
                                    rules={[{ required: true }]}
                                >
                                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="requestor"
                                    label="Requested By"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select Requestor"
                                        optionFilterProp="children"
                                        filterSort={(a, b) =>
                                            String(a?.children).toLowerCase().localeCompare(
                                                String(b?.children).toLowerCase()
                                            )
                                        }
                                    >
                                        {staffList?.map((staff) => (
                                            <Option key={staff.code} value={staff.code}>
                                                {staff.description}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="etd"
                                    label="Estimated Time of Departure"
                                    rules={[{ required: true }]}
                                >
                                    <TimePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="etr"
                                    label="Estimated Time of Return"
                                    rules={[{ required: true }]}
                                >
                                    <TimePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="travelDestination"
                                    label="Travel Destination"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="tripAuthorizor"
                                    label="Person Authorizing Trip"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select Trip Authorizor"
                                        optionFilterProp="children"
                                        filterSort={(a, b) =>
                                            String(a?.children).toLowerCase().localeCompare(
                                                String(b?.children).toLowerCase()
                                            )
                                        }
                                    >
                                        {staffList?.map((staff) => (
                                            <Option key={staff.code} value={staff.code}>
                                                {staff.description}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="visitPurpose" label="Purpose of Visit">
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                            <Col span={24} style={{ textAlign: 'right' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Submit Vehicle Request Application
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default VehicleRequestForm;
