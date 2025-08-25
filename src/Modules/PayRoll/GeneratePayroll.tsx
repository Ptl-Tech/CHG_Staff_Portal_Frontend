import React, { useState } from 'react';
import { Button, Form, Row, Col, Typography, DatePicker, notification, Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '../../hooks/ReduxHooks';
import { generatePayslip, selectGeneratedPayslip } from '../../features/payRoll/payrollservice';
import dayjs from 'dayjs';

const GeneratePayroll: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(selectGeneratedPayslip);
  const [api, contextHolder] = notification.useNotification();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGeneratePayslip = async (values: { month: dayjs.Dayjs; year: dayjs.Dayjs }) => {
    try {
      const payload = {
        month: values.month.month() + 1, 
        year: values.year.year(),
      };

   
      const response = await dispatch(generatePayslip(payload)).unwrap();

      if (response) {
        // Build iframe src
        const fileUrl = `data:application/pdf;base64,${response.baseImage}`;
        setPdfUrl(fileUrl);

        api.success({
          message: 'Success',
          description: 'Payslip generated successfully',
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
        description: err?.message || 'Failed to generate payslip',
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
    <>
   <div
  style={{
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    padding: 24,
    marginBottom: 20,
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
          borderRadius: 8,
        }}
      >
        <Spin size="large" tip="Generating Payslip" />
      </div>
    )}

    {contextHolder}

    <Typography.Title level={4} style={{ marginBottom: 20 }}>
      Generate Payslip
    </Typography.Title>

    <Form
      layout="vertical"
      form={form}
      onFinish={handleGeneratePayslip}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Year"
            name="year"
            rules={[{ required: true, message: 'Please select year' }]}
          >
            <DatePicker
              picker="year"
              placeholder="Select Year"
              format={(val) => dayjs(val).format('YYYY')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Month"
            name="month"
            rules={[{ required: true, message: 'Please select month' }]}
          >
            <DatePicker
              picker="month"
              placeholder="Select Month"
              format={(val) => dayjs(val).format('MMM YYYY')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6} style={{ marginTop: 30 }}>
          <Button type="primary" htmlType="submit" block>
            Generate Payslip
          </Button>
        </Col>
      </Row>
    </Form>
  </div>

  {/* PDF Preview */}
  {pdfUrl && (
    <div style={{ marginTop: 30 }}>
      <Typography.Title level={5}>Payslip Preview</Typography.Title>
      <iframe
        src={pdfUrl}
        title="Payslip Preview"
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

     
    </>
  );
};

export default GeneratePayroll;
