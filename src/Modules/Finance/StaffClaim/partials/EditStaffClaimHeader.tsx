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
    Tag,
    Drawer,
    notification,
} from 'antd';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import {
    fetchClaimDropdownData,
    selectClaimDropdownData,
    selectSubmitClaimRequest,
    submitClaimRequest,
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
    documentNumber: string;
    paymentData: PaymentData | null;
}

const EditStaffClaimHeader: React.FC<HeaderProps> = ({ documentNumber, paymentData }) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const docNo = new URLSearchParams(window.location.search).get('DocumentNo');
    const {
        allImprestSurrenders,
        allStaffClaimTypes,
        status,
    } = useAppSelector(selectClaimDropdownData);
    const { status: submitStatus, error } = useAppSelector(selectSubmitClaimRequest);
    const { status: documentStatus, documents } = useAppSelector(selectDocumentsList);

    const [claimType, setClaimType] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [documentListVisible, setDocumentListVisible] = useState(false);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        //claim type
        const claimType = paymentData?.claimType;
        if (claimType) {
            setClaimType(claimType);
        }
        if (paymentData) {
            form.setFieldsValue({
                claimType: claimType,
                description: paymentData.paymentNarration,
                documentNumber: paymentData.imprestSurrenderNo,
                dateRequested: moment(paymentData.dateRequested),
                status: paymentData.status,
                totalAmount: formatCurrencyUSD(paymentData.imprestAmount),
            });
        }
    }, [paymentData, form]);

    useEffect(() => {
        dispatch(fetchClaimDropdownData());
    }, [dispatch]);


    useEffect(() => {
        if (docNo) {
            dispatch(fetchDocuments({ tableId: 50124, docNo: docNo }));
        }
    }, [docNo, dispatch]);

    const handleFileAttachment = () => {
        setIsMobileView((prev) => !prev);
        setDocumentListVisible((prev) => !prev);
    };

    const SubmitHeader = async (values: any) => {
        const { claimType } = values;
        const claimVal = allStaffClaimTypes.find((item: any) => item.description === claimType)?.code;

        console.log('value', claimVal);
        const payLoad = {
            paymentNo: paymentData?.paymentNo,
            claimType: claimVal,
            paymentNarration: values.description,
            imprestSurrenderNo: values.documentNumber
        };

        const res = await dispatch(submitClaimRequest(payLoad)).unwrap();
        api.success({
            message: 'Success',
            description: `Staff Claim header updated successfully. Document No: ${res.description}`,
        });

    };
    return (
        <div>
            {status === 'pending' || submitStatus === 'pending' ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
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
                            marginBottom: 16,
                            width: '100%',
                        }}
                    >
                        <Typography.Text>
                            <strong>
                                Claim Form - {documentNumber}
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
                    {contextHolder}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Date Requested"
                                name="dateRequested"
                                rules={[
                                    { required: true, message: 'Please select a date' },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Select Date Requested"
                                    format="DD/MM/YYYY"
                                    readOnly
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
                            <Form.Item
                                label="Claim Type"
                                name="claimType"
                                rules={[
                                    { required: true, message: 'Please select a claim type' },
                                ]}
                            >
                                <Select
                                    placeholder="Select Claim Type"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toString()
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={allStaffClaimTypes.map((type) => ({
                                        label: type.description,
                                        value: type.code,
                                    }))}
                                    onChange={(value) => {
                                        setClaimType(value); // 👈 updates local state for conditional rendering
                                        form.setFieldsValue({ claimType: value }); // keep form in sync
                                    }}
                                />
                            </Form.Item>

                        </Col>

                        {claimType === 3 && (
                            <Col span={12}>
                                <Form.Item
                                    label="Document Number"
                                    name="documentNumber"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please select Imprest Document Number',
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="Select Imprest Document Number"
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '')
                                                .toString()
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={allImprestSurrenders.map((plan) => ({
                                            label: plan.description,
                                            value: plan.code,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                        )}
                        <Col span={12}>
                            <Form.Item label="Total Amount" name="totalAmount">
                                <Input readOnly />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Description" name="description">
                                <TextArea rows={4} />
                            </Form.Item>
                        </Col>
                        {claimType !== 3 && (

                            <Col span={24} style={{ textAlign: 'right' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Update Claim Header
                                    </Button>
                                </Form.Item>
                            </Col>
                        )}
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
                        docNo={documentNumber}

                    />
                </Drawer>
            )}
        </div>
    );
};

export default EditStaffClaimHeader;
