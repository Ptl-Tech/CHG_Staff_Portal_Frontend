import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks/ReduxHooks";
import { useState } from "react";
import { Button, Col, DatePicker, Descriptions, Form, Input, notification, Row, Select, Spin } from "antd";
import PageHeader from "../../../../components/PageHeader";
import { selectCancelApprovalApplication } from "../../../../features/common/cancelApprovalReq";
import { selectApprovalApplication } from "../../../../features/common/sendforApproval";
import dayjs from "dayjs";
import { SubmitTrainingRequest } from "../../../../features/trainingMgt/trainingRequisition";

interface RegularRequestDocumentProps {
    requisitonDetails: any;
    dropdowns: any[];
}

const RegularRequestDocument: React.FC<RegularRequestDocumentProps> = ({ requisitonDetails, dropdowns }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
  const [form] = Form.useForm();

    const { message: approvalRes, status: approvalStatus } =
        useAppSelector(selectApprovalApplication);
    const { message: cancelApprovalReq, status: cancelApprovalStatus } =
        useAppSelector(selectCancelApprovalApplication);
const [isEditing, setIsEditing] = useState(false);
    const [isHeaderPinned, setIsHeaderPinned] = useState(true);
    const [api, contextHolder] = notification.useNotification();
 const handleSubmitTrainingRequest = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        requestNo: requisitonDetails.requestNo,
        trainingNeed: values.trainingNeed,
        remarks: values.purpose,
      };

      const res = await dispatch(SubmitTrainingRequest(payload)).unwrap();
      api.success({
        message: "Success",
        description: `Request submitted successfully. ${res.description || ""}`,
        duration: 3,
        onClose: () => {
          navigate(
            `/Training-Management/Document-View?DocumentNo=${encodeURIComponent(
              res.docNo
            )}`
          );
        },
      });
      form.resetFields();
    } catch (error: any) {
      api.error({
        message: "Error",
        description: error || "Failed to submit request",
        duration: 3,
      });
    }
  };

    return (
        <div>

            {contextHolder}
            <div style={{ position: "relative" }}>
                {(approvalStatus === "loading" || cancelApprovalStatus === "loading") && (
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
                        <Spin size="large" tip="Please wait..." />
                    </div>
                )}

                <div className="p-4  mt-4">
                    <Descriptions
                        title="Training Requisition Details "
                        bordered
                        column={2}
                        size="middle"
                    >
                        <Descriptions.Item label="Requisition No">
                            {requisitonDetails?.requestNo ?? "N/A"}
                        </Descriptions.Item>
                       
                        <Descriptions.Item label="Status">
                            {requisitonDetails?.status ?? "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Request Date">{dayjs(requisitonDetails?.requestDate).format("DD/MM/YYYY")}</Descriptions.Item>
                    </Descriptions>
                </div>
                <div className="p-4 bg-white shadow rounded-lg mt-4">
                    <div className="d-flex justify-content-end mb-3">
                        <Button type="primary" onClick={() => setIsEditing(!isEditing)}  icon={isEditing ? <i className="fa fa-close"></i> : <i className="fa fa-edit"></i>}>
                            {isEditing ? "Cancel Edit" : "Edit"}
                        </Button>
                        </div>
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label="Training Need" name="trainingNeed">
                                    <Select defaultValue={requisitonDetails?.trainingNeed}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                                        }
                                        style={{ width: "100%" }}
                                        allowClear
                                    >
                                        {dropdowns?.map((need) => (
                                            <Select.Option key={need.code} value={need.code}>
                                                {need.description}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Destination">
                                    <Input value={requisitonDetails?.destination} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Estimated Cost">
                                    <Input type="number" value={requisitonDetails?.cost} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label="Planned Start Date" style={{ width: "100%" }}>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        defaultValue={dayjs(requisitonDetails?.plannedStartDate)}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Planned End Date" style={{ width: "100%" }}>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        defaultValue={dayjs(requisitonDetails?.plannedEndDate)}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="No of Days">
                                    <Input type="number" value={requisitonDetails?.noOfDays} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>

                            <Col span={24}>
                                <Form.Item label="Training Description" name="purpose">
                                    <Input.TextArea value={requisitonDetails?.description} />
                                </Form.Item>
                            </Col>
                        </Row>
                        {isEditing &&(
                            <Button onClick={handleSubmitTrainingRequest}>
                                Update Details
                                </Button>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default RegularRequestDocument;
