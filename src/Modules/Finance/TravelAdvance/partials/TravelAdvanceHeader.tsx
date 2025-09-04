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
import { fetchResponsibilityCenters, selectResponsibilityCenters } from '../../../../features/common/commonSetups';

const { TextArea } = Input;
const { Option } = Select;

interface HeaderProps {
    onSubmit: (newDocNo: string) => void;
}

const TravelAdvanceHeader = ({ onSubmit }: HeaderProps) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const { responsibilityCenters, status: destStatus } = useAppSelector(selectResponsibilityCenters);
    const { status } = useAppSelector(selectSubmitAdvanceRequest);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        dispatch(fetchResponsibilityCenters());
    }, [dispatch]);



    const onValuesChange = () => {
        const travelDate = form.getFieldValue('travelDate');
        const returnDate = form.getFieldValue('completionDate');
        if (travelDate && returnDate) {
            const diff = returnDate.diff(travelDate, 'day');
            form.setFieldsValue({ noOfDays: diff > 0 ? diff : 0 });
        }
    };

    const SubmitHeader = async(values) => {       

        const payload = {
            ...values,
            docNo:'',
            requestDate: moment().format('YYYY-MM-DD'),
        };

       try {
         const res = await dispatch(submitTravelAdvanceRequest
            (payload)).unwrap();
        api.success({
            message: 'Success',
            description: `You have successfully submitted advance request.Document No: ${res.description}`,
            onClose: () => {
                if (res) onSubmit(res.description);
            }
        });
       } catch (error) {
        console.error('Failed to submit advance request', error);
        api.error({
            message: 'Error',
            description: error && error?.message || 'Failed to submit advance request',
        });
        
       }


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
                    <Typography.Text strong>Imprest Request</Typography.Text>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Request Date"
                                name="dateRequested"
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
                                label="Responsibility Center"
                                name="responsibilityCenter"
                                rules={[{ required: true, message: 'Please enter the responsibility center' }]}
                            >
                                <Select placeholder="Select Responsibility Center">
                                    {responsibilityCenters.map((center) => (
                                        <Option key={center.code} value={center.code}>{center.description}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>




                        <Col span={24}>
                            <Form.Item label="Description" name="purpose" rules={[{ required: true, message: 'Please enter description' }]}>
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
