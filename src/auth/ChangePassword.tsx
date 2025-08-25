// src/pages/ChangePassword.tsx
import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, selectAuth, selectChangePassword } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import { useAppDispatch, useAppSelector } from '../hooks/ReduxHooks';
import type { ChangePasswordState } from '../types/authState';

const { Title } = Typography;

const ChangePasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
const {  error, message: successMessage } = useAppSelector(
selectChangePassword
);


const onFinish = (values: { newPassword: string; confirmPassword: string }) => {
  dispatch(changePassword({ password: values.newPassword }));
};



  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f5f5f5'
    }}>
      <Card style={{ width: 700, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={3} style={{ textAlign: 'center' }}>Change Password</Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
           
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  }
                })
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={status === 'pending'}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
