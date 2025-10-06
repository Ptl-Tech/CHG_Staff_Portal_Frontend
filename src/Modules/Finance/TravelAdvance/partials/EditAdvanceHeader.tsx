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

    fetchImprestDocument,
    selectSubmitAdvanceRequest,
    submitTravelAdvanceRequest,
    type ImprestData,
} from '../../../../features/finance/advanceRequisition';
import { fetchDocuments, selectDocumentsList } from '../../../../features/common/documents';

import ApprovalTrailModal from '../../../../components/ApprovalTrailModal';
import DocumentList from '../../../Documents/DocumentList';
import { fetchResponsibilityCenters, selectResponsibilityCenters } from '../../../../features/common/commonSetups';

const { TextArea } = Input;
const { Option } = Select;

interface HeaderProps {
    documentNumber: string;
    paymentData: ImprestData | null;
}

const EditAdvanceHeader: React.FC<HeaderProps> = ({ documentNumber, paymentData }) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const docNo = new URLSearchParams(window.location.search).get('DocumentNo');

    const { status } = useAppSelector(selectSubmitAdvanceRequest);
    const { documents } = useAppSelector(selectDocumentsList);
    const { responsibilityCenters, status: destStatus } = useAppSelector(selectResponsibilityCenters);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [documentListVisible, setDocumentListVisible] = useState(false);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (paymentData) {
            form.setFieldsValue({
                purpose: paymentData.purpose,
                responsibilityCenter: paymentData.responsibilityCenter,
                dateRequested: paymentData.dateRequested ? moment(paymentData.dateRequested) : null,
            });
        }
    }, [form, paymentData]);

    useEffect(() => {
        dispatch(fetchResponsibilityCenters());
    }, [dispatch]);


    // useEffect(() => {
    //     if (docNo) {
    //         dispatch(fetchDocuments({ tableId: 50126, docNo }));
    //     }
    // }, [docNo, dispatch]);

    const SubmitHeader = async () => {
        const values = await form.validateFields();

        const payload = {
            docNo: documentNumber,
            requestDate: moment().format('YYYY-MM-DD'),
            ...values
        };
        console.log('imprest payload', payload);
        const res = await dispatch(submitTravelAdvanceRequest(payload)).unwrap();
        api.success({
            message: 'Success',
            description: res.description,
        });

        dispatch(fetchImprestDocument({ documentNo: documentNumber }));

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

                        <Col span={24} style={{ textAlign: 'right', display:isReadOnly ? 'none' : 'block' }}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Submit Request
                                </Button>
                            </Form.Item>
                        </Col>
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
