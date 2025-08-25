// src/features/leave/LeaveApplicationForm.tsx
import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Row,
    Col,
    Select,
    Button,
    Skeleton,
    DatePicker,
    InputNumber,
    Tooltip,
    Drawer,
    Tag,
    notification,
} from 'antd';
import { AppstoreAddOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import moment from 'moment';

import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import type { PaymentData } from '../../../../types/PaymentData';

import {
    fetchDestinationList,
    selectDestinationList,
    selectSubmitAdvanceRequest,
    submitTravelAdvanceRequest,
} from '../../../../features/finance/advanceRequisition';
import { fetchDocuments, selectDocumentsList } from '../../../../features/common/documents';

import ApprovalTrailModal from '../../../../components/ApprovalTrailModal';
import DocumentList from '../../../Documents/DocumentList';

const { TextArea } = Input;
const { Option } = Select;

interface HeaderProps {
    documentNumber: string;
    paymentData: PaymentData | null;
}

const EditAdvanceHeader: React.FC<HeaderProps> = ({ documentNumber, paymentData }) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const docNo = new URLSearchParams(window.location.search).get('DocumentNo');

    const { destinationList, status: destStatus } = useAppSelector(selectDestinationList);
    const { status } = useAppSelector(selectSubmitAdvanceRequest);
    const { documents } = useAppSelector(selectDocumentsList);

    const [isReadOnly, setIsReadOnly] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [documentListVisible, setDocumentListVisible] = useState(false);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (paymentData && !form.isFieldsTouched()) {
            form.setFieldsValue({
                ...paymentData,
                travelDate: paymentData.travelDate ? moment(paymentData.travelDate) : null,
                completionDate: paymentData.completionDate ? moment(paymentData.completionDate) : null,
            });
        }
    }, [form, paymentData]);

    useEffect(() => {
        dispatch(fetchDestinationList());
    }, [dispatch]);

    useEffect(() => {
        if (docNo) {
            dispatch(fetchDocuments({ tableId: 50126, docNo }));
        }
    }, [docNo, dispatch]);

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
            typeof values.travelType === 'string' && values.travelType.toLowerCase() === 'local' ? 1 : 0;

        const payload = {
            paymentNo: documentNumber,
            destination: values.destination,
            travelType: travelTypeVal,
            travelDate: values.travelDate.format('YYYY-MM-DD'),
            completionDate: values.completionDate.format('YYYY-MM-DD'),
            noOfDays: values.noOfDays,
            paymentNarration: values.paymentNarration,
        };
console.log('imprest payload', payload);
        const res = await dispatch(submitTravelAdvanceRequest(payload)).unwrap();
        api.success({
            message: 'Success',
            description: `Advance header updated successfully. Document No: ${res.description}`,
        });
    };

    const commonProps = { readOnly: isReadOnly };

    return (
        <div style={{ position: 'relative' }}>
            {contextHolder}
            {destStatus === 'pending' || status === 'pending' ? (
                <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={SubmitHeader}
                    autoComplete="off"
                    onValuesChange={onValuesChange}
                >
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: 16 }}>
                        <Tooltip title="File Attachment">
                            <Button
                                type="default"
                                onClick={() => setDocumentListVisible(true)}
                                icon={<FileTextOutlined />}
                            >
                                File Attachment
                                <Tag color="red" style={{ marginLeft: 4 }}>
                                    {documents.length}
                                </Tag>
                            </Button>
                        </Tooltip>
                        <Tooltip title="Approval Trail">
                            <Button
                                type="dashed"
                                icon={<AppstoreAddOutlined />}
                                onClick={() => setModalVisible(true)}
                            >
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
                                    {...commonProps}
                                >
                                    {destinationList.map((d: any) => (
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
                                <Input placeholder="Auto-filled based on destination" readOnly />
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
                                    {...commonProps}
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
                                    {...commonProps}
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

                        <Col span={12}>
                            <Form.Item label="Status" name="status">
                                <Input readOnly />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Description" name="paymentNarration">
                                <TextArea rows={4} {...commonProps} />
                            </Form.Item>
                        </Col>

                        {!isReadOnly && (
                            <Col span={24} style={{ textAlign: 'right' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Save
                                    </Button>
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </Form>
            )}

            <ApprovalTrailModal visible={modalVisible} onClose={() => setModalVisible(false)} />

            <Drawer
                title="File Attachment"
                placement="right"
                width={800}
                onClose={() => setDocumentListVisible(false)}
                visible={documentListVisible}
            >
                <DocumentList
                    visible={documentListVisible}
                    onClose={() => setDocumentListVisible(false)}
                    documents={documents}
                    tableId={50124}
                    docNo={docNo}
                />
            </Drawer>
        </div>
    );
};

export default EditAdvanceHeader;
