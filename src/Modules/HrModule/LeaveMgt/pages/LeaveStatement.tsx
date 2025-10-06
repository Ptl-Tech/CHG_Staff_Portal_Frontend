import React, { useEffect, useState } from 'react';
import { Button, Form, Row, Col, Typography, Select, notification, Spin } from 'antd';
import { fetchLeaveDropdownData, selectDropdowns } from '../../../../features/leaveApplication/leaveConstantsSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import { selectLeaveStatement, generateLeaveStatement } from '../../../../features/common/documents';
import { downloadFileFromBase64 } from '../../../../utils/downloadBase64File';
import type { AlertInfo } from '../../../../types/dropdown';


const LeaveStatement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { leaveTypes, status: dropdownStatus } = useAppSelector(selectDropdowns);
    const { leaveStatement, status, error } = useAppSelector(selectLeaveStatement);

    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);


    useEffect(() => {
        if (leaveTypes.length === 0) {
            dispatch(fetchLeaveDropdownData());
        }
    }, [dispatch, leaveTypes.length]);
    const handleGenerateLeaveStatement = async (values: { leaveType: string }) => {
        try {

            const response = await dispatch(generateLeaveStatement(values)).unwrap();

            if (response) {
                 const fileUrl = `data:application/pdf;base64,${response.baseImage}`;
        setPdfUrl(fileUrl);

                api.success({
                    message: 'Success',
                    description: 'Leave statement generated successfully',
                    style: {
                        borderColor: '#52c41a',
                        color: '#fff',
                        fontWeight: 'semibold',
                    },
                    duration: 3,
                });
            }
        } catch (err: any) {
              setPdfUrl(null);
            api.error({
                message: 'Error',
                description: err || 'Failed to generate leave statement',
                style: {
                    borderColor: '#ff4d4f',
                    color: '#fff',
                    fontWeight: 'semibold',
                },
                duration: 3,
            });
        }
    };

    return (
        <div
            style={{
               
                position: 'sticky',
                top: 0,
                background: '#fff',
                zIndex: 100,
                paddingBottom: 12,
                paddingTop: 12,
                paddingInline: 20,
                borderBottom: '1px solid #f0f0f0',
                minHeight: '364px',
            }}
        >
            <div style={{ position: 'relative' }}>
                {status === 'loading' && (
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
                    <Spin size="large" tip="Generating Leave Statement" />
                </div>
                )}
                {contextHolder}
                <Form
                    form={form}
                    layout="inline"
                    style={{ flex: 1, marginBottom: 20,maxWidth: 800, marginTop: 40 }}
                    onFinish={handleGenerateLeaveStatement}
                  
                    className='d-block d-md-flex align-items-center justify-content-between g-3'
                >
                    <Typography.Title level={4}>Leave Statement</Typography.Title>

                    <Row gutter={16} style={{ width: '100%' }}>
                        <Col xs={24} md={16} lg={18} style={{ marginBottom: 16 }}>
                            <Form.Item
                                label="Leave Type"
                                name="leaveType"
                                rules={[{ required: true, message: 'Please select a leave type' }]}
                            >
                                <Select
                                    size="large"
                                    placeholder="Select Leave Type"
                                    style={{ width: '100%', color: 'black', fontWeight: 'bold' }}
                                    loading={dropdownStatus === 'pending'}
                                >
                                    {leaveTypes.map((type) => (
                                        <Select.Option key={type.code} value={type.code}>
                                            {type.description}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8} lg={6} style={{ textAlign: 'right', marginBottom: 16 }}>
                            <Button
                                size="large"
                                type="primary"
                                htmlType="submit"
                               // style={{ width: '100%' }}
                            >
                                Generate Statement
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
  {pdfUrl && (
    <div style={{ marginTop: 30 }}>
      <Typography.Title level={5}>Leave Statement Preview</Typography.Title>
      <iframe
        src={pdfUrl}
        title="Leave Statement Preview"
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #ddd',
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  )}
        </div>
    );
};

export default LeaveStatement;
