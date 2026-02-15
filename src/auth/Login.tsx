import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Input,
  Typography,
  type FormProps,
  Form,
  Space,
  notification,
} from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/ReduxHooks";
import { loginUser, resetLogin, selectAuth } from "../features/auth/authSlice";
import loginImg from "../assets/images/loginImg.jpg";
import logoLogin from "../assets/images/logoLogin.png";

type UserData = {
  StaffNo: string;
  Password: string;
};

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, token, message, status } = useAppSelector(selectAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    dispatch(resetLogin());
  }, [dispatch]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleLogin: FormProps["onFinish"] = async (values) => {
    try {
      const res = await dispatch(
        loginUser({
          staffNo: values.StaffNo,
          password: values.Password,
        }) as any
      ).unwrap();

      // ✅ success notification
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
          navigate("/"); // redirect on success
        },
      });
    } catch (err: any) {
      api.error({
        message: "Error",
        description: err.message || "An unexpected error occurred",
        style: { borderColor: "#ff4d4f", color: "#fff" },
        duration: 3,
        onClose: () => {
          dispatch({ type: "auth/clearError" }); // reset error after display
        },
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Card
        className="p-0"
        style={{
          maxWidth: "900px",
          width: "100%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          borderRadius: "8px", // Apply border-radius to the card
        }}
      >
        <div
          className="d-grid"
          style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
        >
          {/* Form Side */}
          <Space direction="vertical" className="p-4">
            <img src={logoLogin} alt="Logo Image" width={240} />

            <Typography.Paragraph
              style={{
                textAlign: "center",
                fontStyle: "italic",
                color: "#888",
              }}
            >
              Sign in to access your account
            </Typography.Paragraph>
            {contextHolder}
            <Form onFinish={handleLogin} autoComplete="off" layout="vertical">
              <Form.Item
                name="StaffNo"
                label="Staff Number"
                rules={[
                  { required: true, message: "Please enter your Staff No" },
                ]}
              >
                <Input size="large" placeholder="Enter your Staff No" />
              </Form.Item>

              <Form.Item
                name="Password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <div style={{ margin: "24px 0" }}>
                <Button
                  size="large"
                  htmlType="submit"
                  type="primary"
                  block
                  disabled={status === "pending"}
                  loading={status === "pending"}
                >
                  {status === "pending" ? "Logging in..." : "Login"}
                </Button>
              </div>
            </Form>

            <div style={{ textAlign: "center" }}>
              <a
                href="/forgot-password"
                style={{ fontSize: "14px", color: "#888" }}
              >
                Forgot password?
              </a>
            </div>
          </Space>
          <div
            className="login-image"
            style={{
              flex: 1,
              maxWidth: "450px",
              minWidth: "300px",
              padding: 0,
              overflow: "hidden",
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
