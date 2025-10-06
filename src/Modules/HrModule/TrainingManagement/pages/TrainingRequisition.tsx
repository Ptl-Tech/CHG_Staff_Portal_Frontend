import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../../hooks/ReduxHooks";
import type { RootState } from "../../../../app/rootReducer";
import {
  fetchTrainingNeedsList,
  fetchTrainingRequisitions,
  SubmitTrainingRequest,
} from "../../../../features/trainingMgt/trainingRequisition";

import {
  Card,
  Button,
  Table,
  Tabs,
  Modal,
  Form,
  Row,
  Col,
  Select,
  Descriptions,
  Input,
  notification,
  Badge,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useDecodedToken } from "../../../../hooks/useDecodedToken";

const { TabPane } = Tabs;

const TrainingRequisition: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, loading, dropdowns } = useSelector(
    (state: RootState) => state.trainingRequisition
  );

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  const nameid = useDecodedToken()?.nameid;
  const staffName = useDecodedToken()?.staffName;

  // Grouped Data
  const grouped = {
    open: data?.filter((req) => req.status?.toLowerCase() === "new"),
    pending: data?.filter(
      (req) => req.status?.toLowerCase() === "pending approval"
    ),
    released: data?.filter((req) => req.status?.toLowerCase() === "approved"),
  };

  useEffect(() => {
    dispatch(fetchTrainingRequisitions());
  }, [dispatch]);

  useEffect(() => {
    if (isModalOpen) dispatch(fetchTrainingNeedsList());
  }, [isModalOpen, dispatch]);

  const handleSubmitTrainingRequest = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        requestNo: "",
        trainingNeed: values.trainingNeed,
        remarks: values.remarks,
      };

      const res = await dispatch(SubmitTrainingRequest(payload)).unwrap();

      api.success({
        message: "Success",
        description: `Request submitted successfully. ${res.description || ""}`,
        duration: 3,
        onClose: () => {
          dispatch(fetchTrainingRequisitions());
          navigate(
            `/Training-Management/Document-View?DocumentNo=${encodeURIComponent(
              res.description
            )}`
          );
        },
      });

      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      console.log(error);
      api.error({
        message: "Error",
        description: error || "Failed to submit request",
        duration: 3,
      });
    }
  };

  const columns: any = [
    {
      title: "Index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      fixed: "left",
    },
    {
      title: "Requisition No.",
      dataIndex: "requestNo",
      key: "requestNo",
      render: (text: string) => (
        <span style={{ cursor: "pointer", fontWeight: "bold" }}>{text}</span>
      ),
      sorter: (a: any, b: any) => a.requestNo.localeCompare(b.requestNo),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
    },
    {
      title: "Planned Start Date",
      dataIndex: "plannedStartDate",
      key: "plannedStartDate",
      render: (date: any) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      title: "Training Need",
      dataIndex: "trainingNeed",
      key: "trainingNeed",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(
              `/Training-Management/Document-View?DocumentNo=${encodeURIComponent(
                record.requestNo
              )}`,
              {
                state: { requisitionDetails: record },
              }
            )
          }
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Training Request"
        style={{ margin: "20px" }}
        extra={
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            New Training Request
          </Button>
        }
      >
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                Open Requests{" "}
                <Badge count={grouped.open?.length || 0} offset={[10, 0]} />
              </span>
            }
            key="1"
          >
            <Table
              loading={loading}
              columns={columns}
              dataSource={grouped.open}
              rowKey="requestNo"
              pagination={{
                defaultPageSize: 45,
                showSizeChanger: true,
                pageSizeOptions: ["25", "50", "75", "100"],
              }}
              scroll={{ x: "max-content" }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                Pending Approval{" "}
                <Badge count={grouped.pending?.length || 0} offset={[10, 0]} />
              </span>
            }
            key="2"
          >
            <Table
              columns={columns}
              dataSource={grouped.pending}
              rowKey="requestNo"
              pagination={{
                defaultPageSize: 45,
                showSizeChanger: true,
              }}
              scroll={{ x: "max-content" }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                Released{" "}
                <Badge count={grouped.released?.length || 0} offset={[10, 0]} />
              </span>
            }
            key="3"
          >
            <Table
              columns={columns}
              dataSource={grouped.released}
              rowKey="requestNo"
              pagination={{
                defaultPageSize: 45,
                showSizeChanger: true,
              }}
              scroll={{ x: "max-content" }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {contextHolder}

      {/* Modal */}
      <Modal
        title="New Training Request"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Staff No">{nameid}</Descriptions.Item>
              <Descriptions.Item label="Staff Name">
                {staffName}
              </Descriptions.Item>
            </Descriptions>
          </Row>

          <Row gutter={16} style={{ marginTop: 20 }}>
            <Col span={12}>
              <Form.Item
                label="Training Need"
                name="trainingNeed"
                rules={[
                  { required: true, message: "Please select a training need" },
                ]}
              >
                <Select
                  placeholder="Select Training Need"
                  style={{ width: "100%" }}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {dropdowns?.map((item) => (
                    <Select.Option key={item.code} value={item.code}>
                      {item.description}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
 <>
              <Col span={12}>
                <Form.Item
                  label="Planned Start Date"
                  name="plannedStartDate"
                  rules={[{ required: true, message: 'Please select planned start date' }]}
                >
                  <Input
                    placeholder="Planned Start Date"
                    style={{
                      width: '100%',
                      backgroundColor: '#f0f0f0',
                      fontWeight: '500',
                      cursor: 'not-allowed', 
                    }}
                    readOnly
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Planned End Date"
                  name="plannedEndDate"
                  rules={[{ required: true, message: 'Please select planned end date' }]}
                >
                  <Input
                    placeholder="Planned End Date"
                    style={{
                      width: '100%',
                      backgroundColor: '#f0f0f0',
                      fontWeight: '500',
                      cursor: 'not-allowed',
                    }}
                    readOnly
                  />
                </Form.Item>
              </Col>
            </>
            <Col span={12}>
              <Form.Item
                label="Remarks"
                name="remarks"
                rules={[{ required: true, message: "Please add remarks" }]}
              >
                <Input.TextArea placeholder="Remarks" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={handleSubmitTrainingRequest}>
                Submit
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingRequisition;
