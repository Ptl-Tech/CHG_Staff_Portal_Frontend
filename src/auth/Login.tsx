import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Input,
  Typography,
  type FormProps,
  Form,
  message,
  notification,
  Space,
} from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/ReduxHooks';
import {  loginUser, selectAuth } from '../features/auth/authSlice';
import loginImg from '../assets/images/loginImg.jpg';
import logoLogin from '../assets/images/logoLogin.png';
import zamzamlg from '../assets/images/zamzamlg.jpg'; // Assuming this is the new logo

type UserData = {
  StaffNo: string;
  Password: string;
};

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
const {  error, token, message } = useAppSelector(selectAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (token) {
      api.success({
        message: 'Success',
        description: message,
        style: {
         // backgroundColor: '#52c41a',
          borderColor: '#52c41a',
          color: '#fff',
          fontWeight: 'semibold'
        },
        duration: 3,
        onClose: () => {
          navigate('/');
        }
      })
    }
  }, [token, navigate]);

  useEffect(() => {
    if ( error) {
      api.error({
        message: 'Error',
        description: error,
        style:{
         // backgroundColor: '#ff4d4f',
          borderColor: '#ff4d4f',
          color: '#fff',
          fontWeight: 'semibold'
        },
        duration: 3,
        onClose: () => {
          dispatch({ type: 'auth/clearError' });
        }
      })
    }
  }, [error]);

  const handleLogin: FormProps['onFinish'] = (values) => {



    dispatch(loginUser({ staffNo: values.StaffNo, password: values.Password }) as any);
  };


  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100"
     >
      <Card
        className="p-0"
        style={{
          maxWidth: "900px",
          width: "100%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          borderRadius: "8px", // Apply border-radius to the card
        }}
      >
        <div className="d-grid"
          style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
         
          {/* Form Side */}
          <Space direction="vertical" className="p-4">
            <img src={logoLogin} alt="Logo Image" width={240} />

            <Typography.Paragraph style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
              Sign in to access your account
            </Typography.Paragraph>
            {contextHolder}
            <Form onFinish={handleLogin} 
            autoComplete='off'
            layout="vertical">
              <Form.Item
                name="StaffNo"
                label="Staff Number"
                rules={[{ required: true, message: 'Please enter your Staff No' }]}
              >
                <Input size="large" placeholder="Enter your Staff No" />
              </Form.Item>

              <Form.Item
                name="Password"
                label="Password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                />


              </Form.Item>

              <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" id="remember" style={{ marginRight: 8 }} />
                <label htmlFor="remember" style={{ color: '#888' }}>
                  Remember me
                </label>
              </div>

              <div style={{ margin: '24px 0' }}>
                <Button
                  size="large"
                  htmlType="submit"
                  type="primary"
                  block
                  loading={status === 'pending'}
                >
                  {status === 'pending' ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </Form>

            <div style={{ textAlign: 'center' }}>
              <a href="/forgot-password" style={{ fontSize: '14px', color: '#888' }}>
                Forgot password?
              </a>
            </div>
          </Space>
          <div
            className="login-image"
            style={{
              flex: 1,
              maxWidth: "450px",
              minWidth: "300px", // Ensure it doesn't shrink too much
              padding: 0, // Remove any padding
              borderRadius: "8px", // Match the card's border-radius
              overflow: "hidden", // Ensure the image is contained within the rounded corners
            }}
          >
            <img
              src={loginImg}
              alt="Login Illustration"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px", // Match the card's border-radius
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
