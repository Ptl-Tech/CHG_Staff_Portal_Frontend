// src/features/leave/RequestModal.tsx
import React, { useEffect } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Row,
    Col,
    Select,
    Button,
    Modal
} from 'antd';
import type { StoreRequisition } from '../../../types/storeRequest';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { fetchStoreReqDropDowns, selectStoreReqDropDowns } from '../../../features/storeRequisitions/storeRequests';
import useApp from 'antd/es/app/useApp';

const { Option } = Select;

interface RequestModalProps {
    visible: boolean;
    onClose: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const dispatch=useAppDispatch();
  const {issuingStoreSetup, itemCategorySetup, itemsListSetup}= useAppSelector(selectStoreReqDropDowns);


useEffect(() => {
    dispatch(fetchStoreReqDropDowns());
}, [dispatch]);

    const handleSubmit = (values: any) => {
        const { requestDate, requiredDate, issueDate } = values;

        const payload: StoreRequisition = {
            ...values,
            startDate: requestDate?.format('YYYY-MM-DD'),
            endDate: requiredDate?.format('YYYY-MM-DD'),
            returnDate: issueDate?.format('YYYY-MM-DD'),
        };

        console.log('Form Data:', payload);
        // dispatch(createStoreRequisition(payload));
        onClose(); // Optional: Close modal after submit
    };

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
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Select Store Item"
                            name="item"
                            rules={[{ required: true, message: 'Please select a store item' }]}
                        >
                            <Select placeholder="Select a store item">
                                {itemCategorySetup?.map((item) => (
                                    <Option key={item.code} value={item.code}>
                                        {item.description}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
 <Col span={8}>
                        <Form.Item
                            label="Select Store Item"
                            name="item"
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
                        <Form.Item label="Planned Quantity" name="plannedQuantity">
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Budget Cost" name="budgetCost">
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Quantity Requested" name="quantity">
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Estimated Unit Cost" name="unitCost">
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Estimated Total Cost" name="lineAmount">
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
