// src/pages/ChangePassword.tsx
import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  message,
  notification,
} from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  changePassword,
  resetPassword,
  selectAuth,
  selectForgetPassword,
} from "../features/auth/authSlice";
import type { AppDispatch } from "../app/store";
import { useAppDispatch, useAppSelector } from "../hooks/ReduxHooks";
import type { ChangePasswordState } from "../types/authState";
import logoLogin from "../assets/images/logoLogin.png";
import loginImg from "../assets/images/loginImg.jpg";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ResetPassword: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const staffNumber = new URLSearchParams(window.location.search).get(
    "staffNo"
  );
  const { error, status, message } = useAppSelector(selectForgetPassword);
  const [api, contextHolder] = notification.useNotification();

  const onFinish = (values: {
    staffNumber: string | null;
    otpCode: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    dispatch(
      resetPassword({
        staffNo: staffNumber,
        randomKey: values.otpCode,
        newPassword: values.newPassword,
      })
    )
      .unwrap()
      .then((res) => {
        api.success({
          message: "Success",
          description: res.message,
          style: {
            borderColor: "#52c41a",
            color: "#fff",
            fontWeight: "semibold",
          },
          duration: 3,
          onClose: () => {
            // Navigate once and keep query param
            navigate("/login");
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
            fontWeight: "bold",
          },
          duration: 3,
          onClose: () => {
            dispatch({ type: "auth/clearError" });
          },
        });
      });
  };

  return (
    <div
      style={{ backgroundColor: "#f8f9fa" }}
      className="d-flex justify-content-center align-items-center min-vh-100"
    >
      <Card
        className="p-0"
        style={{
          maxWidth: "900px",
          width: "100%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          borderRadius: "8px",
        }}
      >
        <div
          className="d-grid"
          style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
        >
          <Space direction="vertical" className="p-4">
            <img src={logoLogin} alt="Logo Image" width={240} />
            <p style={{ color: "#888" }}> Reset your password</p>

            {contextHolder}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="otpCode"
                label="OTP Code"
                rules={[
                  { required: true, message: "Please enter the OTP code" },
                ]}
                hasFeedback
              >
                <Input prefix={<LockOutlined />} placeholder="Enter OTP code" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: "Please enter a new password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter new password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your new password",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={status === "pending"}
                >
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
            <div style={{ textAlign: "right" }}>
              <a href="/login" style={{ fontSize: "14px", color: "#888" }}>
                <u>Go back to Login</u>
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

export default ResetPassword;
