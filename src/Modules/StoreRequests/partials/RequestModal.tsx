import React, { useEffect } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Row,
    Col,
    Select,
    Button,
    Modal,
    notification
} from 'antd';
import type { StoreRequisition } from '../../../types/storeRequest';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { fetchStoreReqDropDowns, fetchStoreRequestLines, selectStoreReqDropDowns, selectSubmitStoreLineRequest, submitStoreLineRequest } from '../../../features/storeRequisitions/storeRequests';
import { ItemsTypesOptions } from '../constants/RequestOptions';

const { Option } = Select;

interface RequestModalProps {
    visible: boolean;
    onClose: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const documentNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const [api, contextHolder] = notification.useNotification();

    const { issuingStoreSetup, itemCategorySetup, itemsListSetup } = useAppSelector(selectStoreReqDropDowns);

    const { status, message, error } = useAppSelector(selectSubmitStoreLineRequest);

    useEffect(() => {
        dispatch(fetchStoreReqDropDowns());
    }, [dispatch]);

    const handleSubmit = async (values: any) => {
        const { requestDate, requiredDate, issueDate } = values;

        const payload: StoreRequisition = {
            ...values,
           docNo:documentNo,
           lineNo : 0
        };

        try {
            const res = await dispatch(submitStoreLineRequest(payload)).unwrap();
            if (documentNo) {
                await dispatch(fetchStoreRequestLines({ documentNo }));
            }

            api.success({
                message: 'Success',
                description: res?.message || 'Request line added successfully',
                duration: 3,
            })

        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to submit request line';
            console.error('Submission error:', errorMessage);

            api.error({
                message: 'Submission Failed',
                description: errorMessage,
                duration: 5,
            });
        }
    }

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            title="Add Store Request Line"
            footer={null}
            destroyOnClose
            style={{ top: 20 }}
            width={800}
        >
                        {contextHolder}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Select Item Type"
                            name="itemType"
                            rules={[{ required: true, message: 'Please select a store item' }]}
                        >
                            <Select placeholder="Select Item Type">
                                {ItemsTypesOptions.map(opt => (
                                    <Select.Option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Select Store Item"
                            name="itemNo"
                            rules={[{ required: true, message: 'Please select a store item' }]}
                        >
                            <Select placeholder="Select a store item">
                                {itemsListSetup?.map((item) => (
                                    <Option key={item.code} value={item.code}>
                                        {item.description}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Select Issuing Store"
                            name="location"
                            rules={[{ required: true, message: 'Please select a store item' }]}
                        >
                            <Select placeholder="Select issuing store">
                                {issuingStoreSetup?.map((item) => (
                                    <Option key={item.code} value={item.code}>
                                        {item.description}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Quantity Requested" name="quantity">
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>


                </Row>

                <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Submit Request Line
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default RequestModal;
