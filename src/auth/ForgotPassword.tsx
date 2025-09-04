// src/pages/ChangePassword.tsx
import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, message, notification } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, forgetPassword, selectAuth, selectForgetPassword } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import { useAppDispatch, useAppSelector } from '../hooks/ReduxHooks';
import type { ChangePasswordState } from '../types/authState';
import logoLogin from '../assets/images/logoLogin.png';
import loginImg from '../assets/images/loginImg.jpg';

import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, message } = useAppSelector(selectForgetPassword);
  const [api, contextHolder] = notification.useNotification();


  const onFinish = (values: { staffNumber: string }) => {
    dispatch(forgetPassword({ StaffNo: values.staffNumber }))
      .unwrap()
      .then((res) => {
        api.success({
          message: "Success",
          description: res.message,
          style: {
            borderColor: "#52c41a",
            color: "#fff",
          },
          duration: 3,
          onClose: () => {
            // Navigate once and keep query param
            navigate(`/reset-password?staffNo=${values.staffNumber}`);
          },
        });
      })
      .catch((err) => {
        api.error({
          message: "Error",
          description: err.message || "An unexpected error occurred",
          style: {
            borderColor: "#ff4d4f",
            color: "#fff",
          },
          duration: 4,
          onClose: () => {
            dispatch({ type: "auth/clearError" });
          },
        });
      });
  };



  return (
    <div style={{ backgroundColor: "#f8f9fa" }}
      className="d-flex justify-content-center align-items-center min-vh-100"
    >
      <Card className="p-0"
        style={{
          maxWidth: "900px",
          width: "100%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          borderRadius: "8px",
        }}>
        <div
          className="d-grid"
          style={{ width: "100%", gridTemplateColumns: "repeat(2, 1fr)" }}
        >


          <Space direction="vertical" className="p-4">

            <img src={logoLogin} alt="Logo Image" width={240} />
            <p style={{ color: "#888" }}>Forget Password</p>

            {contextHolder}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >

              <Form.Item
                name="staffNumber"
                label="Staff Number"
                rules={[{ required: true, message: 'Please enter your staff number' }]}

              >
                <Input size="large" placeholder="Enter your staff number" />
              </Form.Item>


              <Form.Item>
                <Button type="primary" htmlType="submit" loading={status === 'pending'}
                  block>
                  Forget Password
                </Button>
              </Form.Item>
            </Form>
            <div style={{ textAlign: 'right' }}>
              <a href="/login" style={{ fontSize: '11px', color: '#888' }}>
                <u>Go back to Login?</u>
              </a>
            </div>
          </Space>
          <div
            className="forgot-pwd-image"
            style={{
              flex: 1,
              maxWidth: "450px",
              minWidth: "300px",
              padding: 0,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <img
              src={loginImg}
              alt="Forgot Password Illustration"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>

      </Card>
    </div>
  );
};

export default ForgotPassword;
