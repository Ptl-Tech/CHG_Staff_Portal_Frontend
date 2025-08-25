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
    Typography,
    Skeleton,
    notification
} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { fetchPurchaseDropdownData, selectProcurementPlans } from '../../../features/purchaseRequisitions/PurchaseRequestConstants';
import { selectSubmitPurchaseHeader, submitPurchaseHeader } from '../../../features/purchaseRequisitions/purchaseRequisitions';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;

interface HeaderProps {
    onSubmit: (newDocNo: string) => void;
}

const PurchaseHeader: React.FC<HeaderProps> = ({ onSubmit }) => {
    const dispatch = useAppDispatch();
    const navigate=useNavigate();
    const { procurementPlans, status, error } = useAppSelector(selectProcurementPlans);
    const [form] = Form.useForm();
    const { status: submitStatus } = useAppSelector(selectSubmitPurchaseHeader);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (!procurementPlans || procurementPlans.length === 0) {
            dispatch(fetchPurchaseDropdownData());
        }
    }, [dispatch, procurementPlans]);

    const handleSubmitHeader = async (values: any) => {
        const payload = {
            documentNo: '',
            orderDate: values.requestDate.format('YYYY-MM-DD'),
            procurementPlan: values.procurementPlan,
            reasonDescription: values.description || '',
        };

        try {
            const data = await dispatch(submitPurchaseHeader(payload)).unwrap();
            api.success({
                message: 'Success',
                description: `Purchase updated successfully. Document number ${data.description}`,
                duration: 3,
            });
           // onSubmit(data.description);
            navigate(`/procurement/Purchase-Document?DocumentNo=${data.description}`);
        } catch (err: any) {
            api.error({
                message: 'Error',
                description: err?.message || 'Something went wrong',
                duration: 5,
            });
        }
    };

    if (status === 'pending') {
        return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    if (error) {
        return <Typography.Text type="danger">{error}</Typography.Text>;
    }

    return (
        <div>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitHeader}
                autoComplete="off"
                initialValues={{
                    requestDate: moment()
                }}
            >
                <Typography.Text style={{ marginBottom: 16, display: 'block' }}>
                    <strong><u>Requisition Header</u></strong>
                </Typography.Text>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Order Date"
                            name="requestDate"
                            rules={[{ required: true, message: 'Please select a request date' }]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                disabled
                                suffixIcon={<CalendarOutlined />}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Select Procurement Plan"
                            name="procurementPlan"
                            rules={[{ required: true, message: 'Please select a procurement plan' }]}
                        >
                            <Select
                                placeholder="Select a procurement plan"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {procurementPlans.map(plan => (
                                    <Option key={plan.code} value={plan.code}>
                                        {plan.description}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Description" name="description">
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>

                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={submitStatus === 'pending'}>
                                Submit Header
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default PurchaseHeader;
