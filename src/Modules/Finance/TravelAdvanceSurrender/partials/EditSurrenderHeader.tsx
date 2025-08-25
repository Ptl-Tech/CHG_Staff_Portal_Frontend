// src/features/leave/LeaveApplicationForm.tsx
import React, { useEffect, useState } from 'react';
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
    Tooltip,
    Drawer,
    Tag,
} from 'antd';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import {
    fetchClaimDropdownData,
    selectClaimDropdownData,
} from '../../../../features/finance/staffClaim';
import type { PaymentData } from '../../../../types/PaymentData';
import moment from 'moment';
import { formatCurrencyUSD } from '../../../../utils/currencyFormmatter';
import { AppstoreAddOutlined, FileTextOutlined } from '@ant-design/icons';
import ApprovalTrailModal from '../../../../components/ApprovalTrailModal';
import { fetchDocuments, selectDocumentsList } from '../../../../features/common/documents';
import DocumentList from '../../../Documents/DocumentList';

const { TextArea } = Input;
const { Option } = Select;

interface HeaderProps {
    paymentNo?: string | null;
    paymentData: PaymentData | null;
}

const EditSurrenderHeader: React.FC<HeaderProps> = ({ paymentNo, paymentData }) => {
    const dispatch = useAppDispatch();
    const docNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const {
        allImprestSurrenders,
        allStaffClaimTypes,
        status,
        error,
    } = useAppSelector(selectClaimDropdownData);
    const [form] = Form.useForm();
    const { status: documentStatus, documents } = useAppSelector(selectDocumentsList);

    const [isReadOnly, setIsReadOnly] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [documentListVisible, setDocumentListVisible] = useState(false);
    console.log('paymentData', paymentData);

    useEffect(() => {
        if (paymentData) {
            form.setFieldsValue({
                surrenderDate: moment(paymentData.surrenderDate),
                documentNumber: paymentData.paymentNo,
                description: paymentData.paymentNarration,
                completionDate: moment(paymentData.completionDate),
                imprestIssueDocNo: paymentData.imprestIssueDocNo,
                status: paymentData.status,
                amountSpent: formatCurrencyUSD(paymentData.amountSpent),
            });
        }
    }, [paymentData]);

    useEffect(() => {
        if (docNo) {
            dispatch(fetchDocuments({ tableId: 50124, docNo: docNo }));
        }
    }, [docNo, dispatch]);

    const handleFileAttachment = () => {
        setIsMobileView((prev) => !prev);
        setDocumentListVisible((prev) => !prev);
    };



    return (
        <div>
            {status === 'pending' ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : error ? (
                <Typography.Text type="danger">{error}</Typography.Text>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    //     onFinish={SubmitHeader}
                    autoComplete="off"
                    initialValues={{ claimType: '', documentNumber: '' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                            width: '100%',
                        }}
                    >
                        <Typography.Text>
                            <strong>
                                Surrender Document- {paymentNo}
                            </strong>

                        </Typography.Text>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'right',
                            alignItems: 'center',
                            marginBottom: '16px',
                            gap: '10px'
                        }}>
                            <Tooltip title="File Attachment">
                                <Button type="default" onClick={handleFileAttachment} icon={<FileTextOutlined />}>
                                    File Attachment-<Tag color="red" style={{ marginLeft: 4 }}>{documents.length}</Tag>
                                </Button>
                            </Tooltip>
                            <Tooltip title="Approval Trail">
                                <Button type="dashed" icon={<AppstoreAddOutlined />} onClick={() => setModalVisible(true)}>
                                    View Approval Trail
                                </Button>
                            </Tooltip>
                        </div>
                    </div>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Surrender Date"
                                name="surrenderDate"
                                rules={[
                                    { required: true, message: 'Please select a date' },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Select Date Requested"
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Status"
                                name="status"
                            >
                                <Input readOnly />
                            </Form.Item>
                        </Col>



                        <Col span={12}>
                            <Form.Item label="Amount" name="amountSpent">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Imprest Issue Doc Number"
                                name="imprestIssueDocNo"

                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Imprest Issue Date"
                                name="completionDate"
                                rules={[
                                    { required: true, message: 'Please select a date' },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Select Date Requested"
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Description" name="description">
                                <TextArea rows={4} />
                            </Form.Item>
                        </Col>

                    </Row>
                </Form>
            )}

            <ApprovalTrailModal visible={modalVisible} onClose={() => setModalVisible(false)} />
            {isMobileView && (
                <Drawer
                    title="File Attachment"
                    placement="right"
                    width={800}
                    onClose={handleFileAttachment}
                    visible={documentListVisible}
                >
                    <DocumentList
                        visible={documentListVisible}
                        onClose={() => {
                            setDocumentListVisible(false);
                            setIsMobileView(false);
                        }}
                        documents={documents}
tableId={50124}
                        docNo={docNo}
                    />
                </Drawer>
            )}
        </div>
    );
};

export default EditSurrenderHeader;
