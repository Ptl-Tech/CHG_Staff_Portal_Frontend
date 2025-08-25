// src/features/leave/LeaveApplicationForm.tsx
import { useEffect } from 'react';
import {
    Form,
    Input,
    Row,
    Col,
    Select,
    Button,
    Typography,
    Skeleton,
    DatePicker,
    InputNumber,
    notification,
    Spin,
} from 'antd';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import type { PaymentData } from '../../../../types/PaymentData';
import moment from 'moment';
import {
    fetchDestinationList,
    selectDestinationList,
    selectSubmitAdvanceRequest,
    submitTravelAdvanceRequest,
} from '../../../../features/finance/advanceRequisition';

const { TextArea } = Input;
const { Option } = Select;

interface HeaderProps {
    onSubmit: (newDocNo: string) => void;
}

const TravelAdvanceHeader = ({ onSubmit }: HeaderProps) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const { destinationList, status: destStatus } = useAppSelector(selectDestinationList);
    const { status } = useAppSelector(selectSubmitAdvanceRequest);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        dispatch(fetchDestinationList());
    }, [dispatch]);

    const handleDestinationChange = (value: string) => {
        const selected = destinationList.find((d: any) => d.destinationCode === value);
        form.setFieldsValue({ travelType: selected?.travelType || undefined });
    };

    const onValuesChange = () => {
        const travelDate = form.getFieldValue('travelDate');
        const returnDate = form.getFieldValue('completionDate');
        if (travelDate && returnDate) {
            const diff = returnDate.diff(travelDate, 'day');
            form.setFieldsValue({ noOfDays: diff > 0 ? diff : 0 });
        }
    };

    const SubmitHeader = async () => {
         const values = form.getFieldsValue();
        const travelTypeVal =
            typeof values.travelType === 'string' &&
                values.travelType.toLocaleLowerCase() === 'local'
                ? 1
                : 0;

        const payload = {
            paymentNo: '',
            destination: values.destination,
            travelType: travelTypeVal,
            travelDate: values.travelDate.format('YYYY-MM-DD'),
            completionDate: values.completionDate.format('YYYY-MM-DD'),
            noOfDays: values.noOfDays,
            paymentNarration: values.paymentNarration,
        };

        const res = await dispatch(submitTravelAdvanceRequest
            (payload)).unwrap();
        api.success({
            message: 'Success',
            description: `You have successfully submitted advance request.Document No: ${res.description}`,
            onClose: () => {
                if (res) onSubmit(res.description);
            }
        });


    };

    return (
        <div>
            <div style={{ position: 'relative' }}>
                {status === 'pending' && (
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

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={SubmitHeader}
                    autoComplete="off"
                    onValuesChange={onValuesChange}
                >
                    <Typography.Text strong>Advance Request</Typography.Text>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Destination"
                                name="destination"
                                rules={[{ required: true, message: 'Please select a destination' }]}
                            >
                                <Select
                                    placeholder="Select destination"
                                    showSearch
                                    optionFilterProp="children"
                                    onChange={handleDestinationChange}
                                    allowClear
                                >
                                    {destinationList?.map((d: any) => (
                                        <Option key={d.destinationCode} value={d.destinationCode}>
                                            {d.destinationName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Travel Type"
                                name="travelType"
                                rules={[{ required: true, message: 'Travel type is required' }]}
                            >
                                <Input readOnly placeholder="Auto-filled based on destination" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Travel Date"
                                name="travelDate"
                                rules={[{ required: true, message: 'Please select travel date' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) => current && current < moment().startOf('day')}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Return Date"
                                name="completionDate"
                                rules={[{ required: true, message: 'Please select completion date' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) => {
                                        const travelDate = form.getFieldValue('travelDate');
                                        const min = travelDate
                                            ? moment(travelDate).startOf('day')
                                            : moment().startOf('day');
                                        return current && current < min;
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Number of Days"
                                name="noOfDays"
                                rules={[{ required: true, message: 'Number of days is required' }]}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} readOnly />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Description" name="paymentNarration">
                                <TextArea rows={4} />
                            </Form.Item>
                        </Col>

                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Submit Request
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};

export default TravelAdvanceHeader;
