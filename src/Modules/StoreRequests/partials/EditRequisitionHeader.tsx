// src/features/requisition/RequisitionHeader.tsx
import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Row,
    Col,
    Button,
    Typography,
    Tooltip,
    Card,
    Drawer,
    notification,
    Tag,
} from 'antd';
import {
    AppstoreAddOutlined,
    CalendarOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import moment from 'moment';

import PageHeader from '../../../components/PageHeader';
import ApprovalTrailModal from '../../../components/ApprovalTrailModal';
import type { StoreRequisition } from '../../../features/storeRequisitions/storeRequests';
import DocumentList from '../../Documents/DocumentList';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { fetchDocuments, selectDocumentsList } from '../../../features/common/documents';

const { TextArea } = Input;

interface HeaderProps {
    requestHeader: StoreRequisition | null;
}

const EditRequisitionHeader: React.FC<HeaderProps> = ({
    requestHeader,
}) => {
    const dispatch = useAppDispatch();
    const docNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const { documents } = useAppSelector(selectDocumentsList);

    const [form] = Form.useForm();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [documentListVisible, setDocumentListVisible] = useState(false);
    const [api, contextHolder] = notification.useNotification();


    useEffect(() => {
        if (requestHeader) {
            form.setFieldsValue({
                ...requestHeader,
                documentDate: requestHeader.documentDate
                    ? moment(requestHeader.documentDate)
                    : null,
                expectedReceiptDate: requestHeader.expectedReceiptDate
                    ? moment(requestHeader.expectedReceiptDate)
                    : null,
            });
        }
    }, [requestHeader, form]);

    
        useEffect(() => {
            if (docNo) {
                dispatch(fetchDocuments({ tableId: 50126, docNo }));
            }
        }, [docNo, dispatch]);
    

    const SubmitHeader = (values: any) => {
        const payload = {
            ...values,
            documentDate: values.documentDate
                ? values.documentDate.format('YYYY-MM-DD')
                : null,
            expectedReceiptDate: values.expectedReceiptDate
                ? values.expectedReceiptDate.format('YYYY-MM-DD')
                : null,
        };
        console.log('Form Data:', payload);
    };

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                onFinish={SubmitHeader}
                autoComplete="off"
            >
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
                        <strong>
                            <u>Requisition Header</u>
                        </strong>
                    </Typography.Text>
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}
                    >
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
                    </div>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Request Date"
                            name="documentDate"
                            rules={[
                                { required: true, message: 'Please select a request date' },
                            ]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                suffixIcon={<CalendarOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Required Date"
                            name="expectedReceiptDate"
                            rules={[
                                { required: true, message: 'Please select a required date' },
                            ]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                suffixIcon={<CalendarOutlined />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Issuing Location"
                            name="location"
                            rules={[
                                { required: true, message: 'Please enter issuing location' },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    {requestHeader?.documentNo !== '' && (
                        <Col span={12}>
                            <Form.Item
                                label="Status"
                                name="status"

                            >
                                <Input readOnly />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={24}>
                        <Form.Item label="Description" name="reason">
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

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
                    tableId={50126}
                    docNo={docNo}
                />
            </Drawer>
        </div>
    );
};

export default EditRequisitionHeader;
