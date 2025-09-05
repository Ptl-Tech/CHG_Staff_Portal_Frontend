import React, { useMemo, useState } from 'react';
import { Button, Form, Row, Col, Typography, DatePicker, notification, Spin, Modal, Input } from 'antd';
import { useAppDispatch, useAppSelector } from '../../hooks/ReduxHooks';
import { generatePayslip, selectGeneratedPayslip } from '../../features/payRoll/payrollservice';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import { CloseOutlined } from '@ant-design/icons';


interface MyPayload {
  staffNo?: string;
  gender?: string;
  nickname?: string;
}


const GeneratePayroll: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(selectGeneratedPayslip);
  const [api, contextHolder] = notification.useNotification();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');


  const decodedToken = useMemo<MyPayload | null>(() => {
    try {
 const root = JSON.parse(localStorage.getItem('persist:auth') || '{}');
 if (!root) return null;
    const auth = JSON.parse(root.auth || '{}');

    const login = auth.login || {};
         
      
      return login?.token ? jwtDecode<MyPayload>(login.token) : null;
    } catch {
      return null;
    }
  }, []);

    const userPassword = useMemo(() => decodedToken?.nickname?.toLowerCase(), [decodedToken]);

console.log('userPassword', userPassword);
  const handleGeneratePayslip = async (values: { month: dayjs.Dayjs; year: dayjs.Dayjs }) => {
    try {
      const payload = {
        month: values.month.month() + 1,
        year: values.year.year(),
      };
setShowPreview(false);

      const response = await dispatch(generatePayslip(payload)).unwrap();

      if (response) {
        const fileUrl = `data:application/pdf;base64,${response.baseImage}`;
        setPdfUrl(fileUrl);

        api.success({
          message: 'Success',
          description: 'Payslip generated successfully. Please enter your password to view your payslip',
          style: {
            borderColor: '#52c41a',
            color: '#fff',
            fontWeight: 'semibold',
          },
          duration: 3,
        });

        setIsModalOpen(true);
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

  const handlePasswordCheck = () => {
    if (enteredPassword === userPassword) {
      setShowPreview(true);
      setIsModalOpen(false);
      setEnteredPassword('');
    } else {
      api.error({
        message: 'Incorrect Password',
        description: 'The password you entered is invalid',
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
        {showPreview && pdfUrl && (
          <div style={{ marginTop: 30 }}>
           <div className="d-flex justify-content-between align-items-center my-2">
             <Typography.Title level={5}>Payslip Preview</Typography.Title>
             <Button icon={<CloseOutlined/>} onClick={() => setShowPreview(false)} danger/>
           </div>
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
      <Modal
        title="Enter Password"
        open={isModalOpen}
        onOk={handlePasswordCheck}
        onCancel={() => setIsModalOpen(false)}
        okText="Unlock"
      >
        <Input.Password
          placeholder="Enter password to view payslip"
          value={enteredPassword}
          onChange={(e) => setEnteredPassword(e.target.value)}
        />
      </Modal>

    </>
  );
};

export default GeneratePayroll;
