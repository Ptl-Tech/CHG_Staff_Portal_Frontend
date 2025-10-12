// src/features/leave/LeaveApplicationForm.tsx
import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Row,
    Col,
    Select,
    Button,
    Typography,
    Tooltip,
    Skeleton,
    Tag,
    Drawer,
    notification
} from 'antd';
import {
    AppstoreAddOutlined,
    CalendarOutlined,
    EditOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { fetchPurchaseDropdownData, selectProcurementPlans } from '../../../features/purchaseRequisitions/PurchaseRequestConstants';
import { fetchDocuments, selectDocumentsList } from '../../../features/common/documents';
import { selectSubmitPurchaseHeader, submitPurchaseHeader } from '../../../features/purchaseRequisitions/purchaseRequisitions';
import ApprovalTrailModal from '../../../components/ApprovalTrailModal';
import DocumentList from '../../Documents/DocumentList';

const { Option } = Select;

interface PurchaseHeaderProps {
    documentNo: string | null;
    purchaseRequisition: PurchaseHeader | null;
}

const EditPurchaseHeader: React.FC<PurchaseHeaderProps> = ({ documentNo, purchaseRequisition }) => {
    const dispatch = useAppDispatch();
    const { procurementPlans, status, error } = useAppSelector(selectProcurementPlans);
    const { documents } = useAppSelector(selectDocumentsList);
    const { status: submitStatus } = useAppSelector(selectSubmitPurchaseHeader);
    const docNo= new URLSearchParams(window.location.search).get('DocumentNo');

    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = useState(false);
    const [documentListVisible, setDocumentListVisible] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [api, contextHolder] = notification.useNotification();

    // Populate form if purchase requisition is provided
    useEffect(() => {
        if (purchaseRequisition) {
            form.setFieldsValue({
                requestDate: purchaseRequisition.orderDate ? moment(purchaseRequisition.orderDate) : null,
                procurementPlan: purchaseRequisition.procurementPlan,
                description: purchaseRequisition.reasonDescription,
                status: purchaseRequisition.status
            });
        }
    }, [purchaseRequisition, form]);

    // Fetch procurement plans if not loaded
    useEffect(() => {
        if (procurementPlans.length === 0) {
            dispatch(fetchPurchaseDropdownData());
        }
    }, [dispatch, procurementPlans.length]);

    // Fetch documents if documentNo exists
    useEffect(() => {
        if (documentNo) {
            dispatch(fetchDocuments({ tableId: 50126, docNo: documentNo }));
        }
    }, [documentNo, dispatch]);

const SubmitHeader = (values: any) => {
    const payload = {
       documentNo: docNo, // pulled from query string at the top
        orderDate: values.requestDate.format('YYYY-MM-DD'),
        procurementPlan: values.procurementPlan,
        reasonDescription: values.description,
    };

    dispatch(submitPurchaseHeader(payload))
        .unwrap()
        .then((data) => {
            console.log('data ', data);
            api.success({
                message: 'Success',
                description: `Purchase updated successfully. Document number ${data.description}`
            });
        })
        .catch((err) => {
            api.error({
                message: 'Error',
                description: err?.message || 'Something went wrong'
            });
        });
};


    const handleFileAttachment = () => {
        setDocumentListVisible((prev) => !prev);
    };

    const commonProps = { readOnly: isReadOnly };

    return (
        <div>
            {contextHolder}

            {status === 'pending' ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={SubmitHeader}
                    autoComplete="off"
                >
                    {/* Header Actions */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            width: '100%',
                        }}
                    >
                        <Typography.Text>
                            <strong><u>Requisition Header</u></strong>
                        </Typography.Text>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Tooltip title="File Attachment">
                                <Button
                                    type="default"
                                    onClick={handleFileAttachment}
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
                    </div>

                    {/* Form Fields */}
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item
                                label="Order Date"
                                name="requestDate"
                                rules={[{ required: true, message: 'Please select a request date' }]}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    style={{ width: '100%' }}
                                    {...commonProps}
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
                                    {...commonProps}
                                >
                                    {procurementPlans.map(plan => (
                                        <Option key={plan.code} value={plan.code}>
                                            {plan.description}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
 <Col span={6}>
                            <Form.Item
                                label="Status"
                                name="status"
                               
                            >
                            <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Description" name="description">
                                <Input.TextArea rows={4} {...commonProps} placeholder="Enter a description" />
                            </Form.Item>
                        </Col>

                        {!isReadOnly && (
                            <Col span={24} style={{ textAlign: 'right' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={submitStatus === 'pending'}>
                                        Submit Header
                                    </Button>
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </Form>
            )}

            {/* Drawer for File Attachments */}
            <Drawer
                title="File Attachment"
                placement="right"
                width={800}
                onClose={handleFileAttachment}
                open={documentListVisible} // AntD v5
            >
                <DocumentList
                    visible={documentListVisible}
                    onClose={() => setDocumentListVisible(false)}
                    documents={documents}
                    tableId={50126}
                    docNo={documentNo}
                />
            </Drawer>

            {/* Approval Trail Modal */}
            <ApprovalTrailModal visible={modalVisible} onClose={() => setModalVisible(false)} />
        </div>
    );
};

export default EditPurchaseHeader;
