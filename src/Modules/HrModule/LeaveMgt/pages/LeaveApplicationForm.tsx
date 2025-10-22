import React, { useEffect, useCallback } from "react";
import {
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Select,
  Button,
  Card,
  Typography,
  Tooltip,
  Skeleton,
  Spin,
  message,
  Alert,
  notification,
} from "antd";
import {
  AppstoreAddOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ApprovalTrailModal from "../../../../components/ApprovalTrailModal";
import PageHeader from "../../../../components/PageHeader";
import type { LeaveApplication } from "../../../../types/leave";
import { useAppDispatch, useAppSelector } from "../../../../hooks/ReduxHooks";
import {
  fetchLeaveDropdownData,
  selectDropdowns,
} from "../../../../features/leaveApplication/leaveConstantsSlice";
import {
  fetchReturnDates,
  selectReturnDates,
} from "../../../../features/leaveApplication/fetchLeaveReturnDates";
import moment, { duration } from "moment";
import {
  selectLeaveApplication,
  submitLeaveApplication,
} from "../../../../features/leaveApplication/leaveApplicationSlice";
import type { AlertInfo } from "../../../../types/dropdown";
import { parseDate } from "../../../../utils/dateParser";
import {
  cancelApproval,
  selectCancelApprovalApplication,
} from "../../../../features/common/cancelApprovalReq";
import { fetchLeaves } from "../../../../features/leaveApplication/leaveListSlice";
import {
  selectApprovalApplication,
  sendForApproval,
} from "../../../../features/common/sendforApproval";
import {
  fetchLeaveDocument,
  selectLeaveDocument,
} from "../../../../features/leaveApplication/fetchLeaveDocument";

const { TextArea } = Input;
const { Option } = Select;

const LeaveApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const leaveNo = new URLSearchParams(window.location.search).get("DocumentNo");
  const isEditMode = Boolean(leaveNo);
  const { leaveTypes, relievers, responsibilityCenters, status, error } =
    useAppSelector(selectDropdowns);
  const { status: returnStatus } = useAppSelector(selectReturnDates);
  const { status: resStatus } = useAppSelector(selectLeaveApplication);
  const { message: approvalRes, status: approvalStatus } = useAppSelector(
    selectApprovalApplication
  );
  const { message: cancelApprovalReq, status: cancelApprovalStatus } =
    useAppSelector(selectCancelApprovalApplication);
  const {
    leave: leaveData,
    status: leaveStatus,
    error: leaveError,
  } = useAppSelector(selectLeaveDocument);
  const [alertInfor, setAlertInfor] = React.useState<AlertInfo>(null);
  const [form] = Form.useForm();
  const [isHeaderPinned, setIsHeaderPinned] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (leaveNo) {
      dispatch(fetchLeaveDocument({ leaveNo }));
    } else {
      form.resetFields();
    }
  }, [leaveNo, dispatch, form]);
  useEffect(() => {
    if (
      leaveTypes.length === 0 ||
      relievers.length === 0 ||
      responsibilityCenters.length === 0
    ) {
      dispatch(fetchLeaveDropdownData());
    }
  }, [
    dispatch,
    leaveTypes.length,
    relievers.length,
    responsibilityCenters.length,
  ]);

  useEffect(() => {
    if (isEditMode && leaveData && relievers.length > 0) {
      const relieverCode = relievers.find(
        (reliever) => reliever.description === leaveData.reliever
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

  const getReturnDate = async (values: any) => {
    const { leaveType, startDate, endDate } = values;
    if (!leaveType || !startDate || !endDate) return;

    const payload = {
      leaveNo: form.getFieldValue("leaveNo") || "",
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

      const params = new URLSearchParams(window.location.search);
      params.set("DocumentNo", data.leaveNo);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    } catch (err: any) {
      form.setFieldsValue({ returnDate: null, endDate: null, leaveNo: null });
      api.error({
        message: "Error",
        description: err?.message || "Error fetching return date",
        style: { borderColor: "#ff4d4f", fontWeight: "semibold" },
        duration: 3,
      });
    }
  };

  const handleFinish = async (values: any) => {
    const docNo = new URLSearchParams(window.location.search).get("DocumentNo");
    const payload: LeaveApplication = {
      ...values,
      leaveNo: docNo,
      reliever: values.reliever ?? leaveData?.reliever ?? null,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
      returnDate: moment(values.returnDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      leaveDays: Number(values.days),
      remarks: values.purpose,
    };

    try {
      const res = await dispatch(submitLeaveApplication(payload)).unwrap();

      api.success({
        message: "Success",
        description: res.responseDTO?.description,
        style: { borderColor: "#52c41a", fontWeight: "semibold" },
        duration: 3,
        onClose: () => {
          dispatch(fetchLeaves());
          navigate(
            `/Leave Application/Leave-Document?DocumentNo=${res?.docNo}`
          );
        },
      });
    } catch (err: any) {
      api.error({
        message: "Error",
        description: err?.message || "Failed to submit leave application",
        style: { borderColor: "#ff4d4f", fontWeight: "semibold" },
        duration: 3,
      });
    }
  };

  const handleSendForApproval = () => {
    if (!leaveNo) return;

    dispatch(
      sendForApproval({
        docNo: leaveNo,
        endpoint: `/Leave/send-approval?leaveNo=${leaveNo}`,
      })
    )
      .unwrap()
      .then((response) => {
        api.success({
          message: "Success",
          description: response.message,
          style: {
            // backgroundColor: '#52c41a',
            borderColor: "#52c41a",
            color: "#fff",
            fontWeight: "semibold",
          },
          duration: 3,
          onClose: () => {
            dispatch(fetchLeaves());
            navigate("/Leave Application/Leave-List");
          },
        });
      })
      .catch((error) => {
        api.error({
          message: "Error",
          description: error.message || "Failed to send for approval",
          style: {
            // backgroundColor: '#ff4d4f',
            borderColor: "#ff4d4f",
            color: "#fff",
            fontWeight: "semibold",
          },
          duration: 3,
          onClose: () => {
            dispatch({ type: "RESET" });
          },
        });
      });
  };

  const handleCancelApproval = () => {
    if (!leaveNo) return;

    dispatch(
      cancelApproval({
        docNo: leaveNo,
        endpoint: `/Leave/cancel-approval?leaveNo=${leaveNo}`, // use `leaveNo` not `docNo`
      })
    )
      .unwrap()
      .then((response) => {
        api.success({
          message: "Success",
          description: response.message,
          style: {
            // backgroundColor: '#52c41a',
            borderColor: "#52c41a",
            color: "#fff",
            fontWeight: "semibold",
          },
          duration: 3,
          onClose: () => {
            dispatch(fetchLeaves());

            navigate("/Leave Application/Leave-List");
          },
        });
      })
      .catch((error) => {
        api.error({
          message: "Error",
          description: error.message || "Failed to cancel approval",
          style: {
            // backgroundColor: '#ff4d4f',
            borderColor: "#ff4d4f",
            color: "#fff",
            fontWeight: "semibold",
          },
          duration: 3,
          onClose: () => {
            dispatch({ type: "RESET" });
          },
        });
      });
  };

  return (
    <div>
      <PageHeader
        title=""
        isPinned={isHeaderPinned}
        onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
        showActions={true}
        onSendForApproval={handleSendForApproval}
        onCancelApproval={handleCancelApproval}
      />
      <Card>
        {status === "pending" ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : error ? (
          <Typography.Text type="danger">{error}</Typography.Text>
        ) : (
          <div style={{ position: "relative" }}>
            {(returnStatus === "pending" ||
              resStatus === "pending" ||
              approvalStatus === "loading" ||
              cancelApprovalStatus === "loading" ||
              leaveStatus === "pending") && (
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
                }}
              >
                <Typography.Title level={4}>
                  Leave Application Form
                </Typography.Title>
                <div>
                  <Tooltip title="File Attachment">
                    <Button type="text" icon={<FileTextOutlined />}>
                      File Attachment
                    </Button>
                  </Tooltip>
                  <Tooltip title="Approval Trail">
                    <Button
                      type="default"
                      icon={<AppstoreAddOutlined />}
                      onClick={() => setModalVisible(true)}
                    >
                      View Approval Trail
                    </Button>
                  </Tooltip>
                </div>
              </div>

              <Row gutter={16}>
                {/* Leave Type */}
                <Col span={12}>
                  <Form.Item
                    label="Leave Type"
                    name="leaveType"
                    rules={[
                      { required: true, message: "Please select a leave type" },
                    ]}
                  >
                    <Select
                      placeholder="Select Leave Type"
                      style={{ width: "100%" }}
                    >
                      {leaveTypes.map((type) => (
                        <Option key={type.code} value={type.code}>
                          {type.description}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Reliever */}
                <Col span={12}>
                  <Form.Item label="Reliever Staff No" name="reliever">
                    <Select
                      placeholder="Select Reliever"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {relievers.map((reliever) => (
                        <Option key={reliever.code} value={reliever.code}>
                          {reliever.description}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Dates */}
                <Col span={12}>
                  <Form.Item
                    label="Start Date"
                    name="startDate"
                    rules={[
                      { required: true, message: "Please select a start date" },
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
                    label="End Date"
                    name="endDate"
                    rules={[
                      { required: true, message: "Please select an end date" },
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
                      placeholder="Enter number of days"
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Return Date"
                    name="returnDate"
                    rules={[
                      { required: true, message: "Return date is required" },
                    ]}
                  >
                    <Input readOnly style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                {/* Responsibility Center */}
                {/* <Col span={12}>
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
                                </Col> */}

                {/* Remarks */}
                <Col span={24}>
                  <Form.Item label="Purpose of Leave" name="purpose">
                    <TextArea
                      rows={3}
                      placeholder="Reason for applying leave"
                    />
                  </Form.Item>
                </Col>

                {/* Submit */}
                <Col span={24} style={{ textAlign: "right" }}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Submit Leave Application
                    </Button>
                  </Form.Item>
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

export default LeaveApplicationForm;
