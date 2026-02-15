import {
  EditOutlined,
  CalendarOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import {
  Col,
  Row,
  Form,
  Card,
  Spin,
  Input,
  Select,
  Button,
  Tooltip,
  Skeleton,
  DatePicker,
  Typography,
  notification,
} from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import {
  cancelApproval,
  selectCancelApprovalApplication,
} from "../../../../features/common/cancelApprovalReq";
import {
  sendForApproval,
  selectApprovalApplication,
} from "../../../../features/common/sendforApproval";
import PageHeader from "../../../../components/PageHeader";
import type { AlertInfo } from "../../../../types/dropdown";
import type { LeaveApplication } from "../../../../types/leave";
import {
  fetchLeaveDocument,
  selectLeaveDocument,
} from "../../../../features/leaveApplication/fetchLeaveDocument";
import {
  fetchLeaveDropdownData,
  selectDropdowns,
} from "../../../../features/leaveApplication/leaveConstantsSlice";
import {
  fetchReturnDates,
  selectReturnDates,
} from "../../../../features/leaveApplication/fetchLeaveReturnDates";
import {
  selectLeaveApplication,
  submitLeaveApplication,
} from "../../../../features/leaveApplication/leaveApplicationSlice";
import ApprovalTrailModal from "../../../../components/ApprovalTrailModal";
import { useAppDispatch, useAppSelector } from "../../../../hooks/ReduxHooks";
import { fetchLeaves } from "../../../../features/leaveApplication/leaveListSlice";

const { TextArea } = Input;
const { Option } = Select;

const LeaveDocumentView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const leaveNo = new URLSearchParams(window.location.search).get("DocumentNo");
  const isEditMode = Boolean(leaveNo);

  const { leave: leaveData, status: leaveStatus } =
    useAppSelector(selectLeaveDocument);
  const { leaveTypes, relievers, responsibilityCenters, error } =
    useAppSelector(selectDropdowns);

  const { status: returnStatus } = useAppSelector(selectReturnDates);
  const { status: resStatus } = useAppSelector(selectLeaveApplication);

  const { status: approvalStatus } = useAppSelector(selectApprovalApplication);
  const { status: cancelApprovalStatus } = useAppSelector(
    selectCancelApprovalApplication,
  );

  const [form] = Form.useForm();

  const [isReadOnly, setIsReadOnly] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isHeaderPinned, setIsHeaderPinned] = useState(true);
  const [_, setAlertInfor] = React.useState<AlertInfo>(null);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (leaveNo) {
      dispatch(fetchLeaveDocument({ leaveNo }));
      dispatch(fetchLeaveDropdownData());
    } else {
      form.resetFields();
    }
  }, [leaveNo, dispatch, form]);
  useEffect(() => {
    if (isEditMode && leaveData && relievers.length > 0) {
      //normalize the reliever code
      const relieverCode = relievers.find(
        (reliever) => reliever.description === leaveData.reliever,
      )?.code;

      form.setFieldsValue({
        ...leaveData,
        leaveType: leaveData.leaveType,
        purpose: leaveData.remarks,
        startDate: leaveData.startDate
          ? moment(leaveData.startDate, "YYYY-MM-DD")
          : null,
        endDate: leaveData.endDate
          ? moment(leaveData.endDate, "YYYY-MM-DD")
          : null,
        returnDate: leaveData.returnDate
          ? moment(leaveData.returnDate, "YYYY-MM-DD").format("DD/MM/YYYY")
          : null,
        days: leaveData.leaveDays,
        responsibilityCenter: leaveData.responsibilityCenter,
        reliever: relieverCode || null,
        remarks: leaveData.remarks,
      });
    }
  }, [isEditMode, leaveData, form, relievers]);

  useEffect(() => {
    if (leaveTypes.length === 0 || relievers.length === 0) {
      dispatch(fetchLeaveDropdownData());
    }
  }, [
    dispatch,
    leaveTypes.length,
    relievers.length,
    responsibilityCenters.length,
  ]);

  const getReturnDate = async (values: any) => {
    const { leaveType, startDate, endDate } = values;
    if (!leaveType || !startDate) return;
    const payload = {
      leaveNo: leaveNo || "",
      leaveType,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
    };

    try {
      const data = await dispatch(fetchReturnDates(payload)).unwrap();
      form.setFieldsValue({
        returnDate: data.returnDate
          ? moment(data.returnDate, "MM/DD/YY").format("DD/MM/YYYY")
          : null,
        endDate: data.endDate ? moment(data.endDate, "MM/DD/YY") : null,
        days: data.leaveDays,
        leaveNo: data.leaveNo,
      });
    } catch (err: any) {
      form.setFieldsValue({ returnDate: null, endDate: null, leaveNo: null });
      setAlertInfor({ message: err?.message, type: "error" });
      api.error({
        message: "Error",
        description: err?.message || "Error fetching return date",
        style: {
          color: "#fff",
          fontWeight: "semibold",
          borderColor: "#ff4d4f",
        },
        duration: 5,
        onClose: () => {
          dispatch({ type: "RESET" });
        },
      });
    }
  };

  const handleFinish = async (values: any) => {
    const payload: LeaveApplication = {
      ...values,
      leaveNo,
      reliever: values.reliever ?? leaveData?.reliever ?? null,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
      returnDate: moment(values.returnDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      leaveDays: Number(values.days),
      remarks: values.purpose,
    };

    try {
      const res = await dispatch(submitLeaveApplication(payload)).unwrap();

      setAlertInfor({ message: res.responseDTO?.description, type: "success" });
      api.success({
        message: res.responseDTO?.description,
        // placement: 'bottomRight',
      });
      form.setFieldsValue({
        leaveNo: res.leaveNo,

        //extract the date     "returnDate": "08/28/25##3",

        returnDate: res.returnDate
          ? moment(res.returnDate, "MM/DD/YY").format("DD/MM/YYYY")
          : null,
        endDate: res.endDate ? moment(res.endDate) : null,
      });
    } catch (err: any) {
      setAlertInfor({ message: err?.message, type: "error" });

      api.error({
        message: err?.message,
        // placement: 'bottomRight',
      });
    }
  };

  const commonProps = { readOnly: isReadOnly };

  return (
    <div>
      <PageHeader
        title=""
        isPinned={isHeaderPinned}
        onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
      />
      <Card>
        {leaveStatus === "pending" ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : error ? (
          <Typography.Text type="danger">{error}</Typography.Text>
        ) : (
          <div style={{ position: "relative" }}>
            {(returnStatus === "pending" ||
              resStatus === "pending" ||
              approvalStatus === "loading" ||
              cancelApprovalStatus === "loading") && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 999,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Spin size="large" tip="Processing request... Please wait." />
              </div>
            )}

            {contextHolder}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              autoComplete="off"
              onValuesChange={(changedValues, allValues) => {
                if (
                  changedValues.leaveType ||
                  changedValues.startDate ||
                  changedValues.endDate
                ) {
                  getReturnDate(allValues);
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  gap: "16px",
                }}
              >
                <Typography.Text strong>
                  Leave Application Form-{leaveNo}
                </Typography.Text>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Tooltip title="Approval Trail">
                    <Button
                      type="dashed"
                      icon={<AppstoreAddOutlined />}
                      onClick={() => setModalVisible(true)}
                    >
                      View Approval Trail
                    </Button>
                  </Tooltip>
                  <Tooltip title={isReadOnly ? "Edit Form" : "Disable Editing"}>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsReadOnly((prev) => !prev)}
                    >
                      {isReadOnly ? "Edit" : "Disable Edit"}
                    </Button>
                  </Tooltip>
                </div>
              </div>

              <Row gutter={16}>
                <Col span={24}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Leave Type"
                        name="leaveType"
                        rules={[
                          {
                            required: true,
                            message: "Please select a leave type",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select Leave Type"
                          style={{
                            width: "100%",
                            color: "black",
                            fontWeight: "bold",
                          }}
                          {...commonProps}
                        >
                          {leaveTypes.map((type) => (
                            <Option key={type.code} value={type.code}>
                              {type.description}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Reliever"
                        name="reliever"
                        rules={[
                          {
                            required: true,
                            message: "Please select a reliever",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select Reliever"
                          style={{ width: "100%" }}
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          {...commonProps}
                        >
                          {relievers.map((reliever) => (
                            <Option key={reliever.code} value={reliever.code}>
                              {reliever.description}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Start Date"
                        name="startDate"
                        rules={[
                          {
                            required: true,
                            message: "Please select a start date",
                          },
                        ]}
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          style={{ width: "100%" }}
                          suffixIcon={<CalendarOutlined />}
                          {...commonProps}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="End Date"
                        name="endDate"
                        rules={[
                          {
                            required: true,
                            message: "Please select an end date",
                          },
                        ]}
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          style={{ width: "100%" }}
                          suffixIcon={<CalendarOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="No of Days"
                        name="days"
                        rules={[
                          {
                            required: true,
                            message: "Please input number of days",
                          },
                        ]}
                      >
                        <Input
                          type="number"
                          readOnly
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Return Date"
                        name="returnDate"
                        rules={[
                          {
                            required: true,
                            message: "Return date is required",
                          },
                        ]}
                      >
                        <Input readOnly style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item label="Purpose of Leave" name="purpose">
                        <TextArea
                          rows={3}
                          placeholder="Reason for applying leave"
                          {...commonProps}
                        />
                      </Form.Item>
                    </Col>

                    {!isReadOnly && (
                      <Col span={24} style={{ textAlign: "right" }}>
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            Submit Leave Application
                          </Button>
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Card>

      <ApprovalTrailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default LeaveDocumentView;
