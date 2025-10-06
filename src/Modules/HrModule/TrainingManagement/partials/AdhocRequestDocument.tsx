import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks/ReduxHooks";
import { useState } from "react";
import {
  Button,
  DatePicker,
  Descriptions,
  Input,
  notification,
  Spin,
  Table,
  Tooltip,
  Select,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { fetchTrainingDocumentDetails, submitAdhocLines } from "../../../../features/trainingMgt/trainingRequisition";
import {
  selectCancelApprovalApplication,
} from "../../../../features/common/cancelApprovalReq";
import {
  selectApprovalApplication,
} from "../../../../features/common/sendforApproval";
import { deleteLineItem } from "../../../../features/common/deleteLineItem";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import moment from "moment";

interface AdhocRequestDocumentProps {
  requisitonDetails: any;
  lineDetails: any;
  dropdowns: any;
}

const AdhocRequestDocument: React.FC<AdhocRequestDocumentProps> = ({
  requisitonDetails,
  lineDetails,
  dropdowns,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const docNo = new URLSearchParams(window.location.search).get("DocumentNo");
  const { status: approvalStatus } = useAppSelector(selectApprovalApplication);
  const { status: cancelApprovalStatus } = useAppSelector(
    selectCancelApprovalApplication
  );

  const { linesDetails } = useSelector((state: RootState) => state.trainingRequisition);


  const [api, contextHolder] = notification.useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [localRows, setLocalRows] = useState<any[]>(lineDetails || []);
  const [deletingLineId, setDeletingLineId] = useState<string | null>(null);

  const getRowKey = (record: any) => record.adhocRequestNo || record.tempId;

  const handleAddLine = () => {
    const rowId = uuidv4();
    const newLine = {
      tempId: rowId,
      adhocRequestNo: "",
      trainingArea: "",
      trainingName: "",
      trainingObjectives: "",
      trainingVenue: "",
      trainingProvider: "",
      registrationFee: 0.0,
      startDate: null,
      endDate: null,
    };
    setLocalRows((prev) => [...prev, newLine]);
  };

  const handleRemoveLine = (key: string) => {
    setLocalRows((prev) => prev.filter((r) => getRowKey(r) !== key));
  };

  const handleFieldChange = (record: any, field: string, value: any) => {
    const key = getRowKey(record);
    setLocalRows((prev) =>
      prev.map((row) =>
        getRowKey(row) === key ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDeleteLine = async (record: any) => {
    const lineId = record.adhocRequestNo || getRowKey(record);
    setDeletingLineId(lineId);

    try {
      const res = await dispatch(
        deleteLineItem({
          docNo: requisitonDetails.requestNo || "",
          lineNo: record.adhocRequestNo,
          endpoint: "/Training/delete-adhoc-line",
        })
      ).unwrap();

      api.success({
        message: "Success",
        description: res.description,
        duration: 3,
        onClose: () => {
          dispatch(fetchTrainingDocumentDetails(docNo));
        }
      });

    } catch (err: any) {
      api.error({
        message: "Error",
        description: err?.message || "Failed to delete line",
      });
    } finally {
      setDeletingLineId(null);
    }
  };

  const handleSubmitLines = async () => {
    console.log(localRows);
    const startdate = dayjs(localRows[0].startDate, "YYYY-MM-DD").format("YYYY-MM-DD");
    const endate =dayjs(localRows[0].endDate, "YYYY-MM-DD").format("YYYY-MM-DD");

    try {
      const payload = localRows.map((line) => ({
        sourceDocument: requisitonDetails.requestNo,
        adhocRequestNo: line.adhocRequestNo || null,
        trainingArea: line.trainingArea,
        trainingName: line.trainingName,
        trainingObjectives: line.trainingObjectives,
        trainingVenue: line.trainingVenue,
        trainingProvider: line.trainingProvider,
        registrationFee: line.registrationFee,
        startDate: startdate,
        endDate: endate,
      }));
      console.log(payload);
      await dispatch(submitAdhocLines(payload)).unwrap();

      api.success({
        message: "Success",
        description: "Lines submitted successfully",
        duration: 3,
        onClose: () => {
          dispatch(fetchTrainingDocumentDetails(requisitonDetails.requestNo));
        }
      });
      setIsEditing(false);
    } catch (error: any) {
      api.error({
        message: "Error",
        description: error?.message || "Failed to submit lines",
        duration: 3,
      });
    }
  };

  const columns = [
    {
      title: "Training Area",
      dataIndex: "trainingArea",
      key: "trainingArea",
      width: 180,
      render: (value: any, record: any) =>
        isEditing ? (
          <Select
            style={{ width: "100%" }}
            value={value}
            options={dropdowns?.map((area: any) => ({
              label: area.description,
              value: area.code,
            }))}
            onChange={(val) => handleFieldChange(record, "trainingArea", val)}
          />
        ) : (
          dropdowns.find((a: any) => a.code === value)?.description || "N/A"
        ),
    },
    {
      title: "Training Name",
      dataIndex: "trainingName",
      key: "trainingName",
      width: 200,
      render: (value: any, record: any) =>
        isEditing ? (
          <Input
            value={value}
            onChange={(e) =>
              handleFieldChange(record, "trainingName", e.target.value)
            }
          />
        ) : (
          value || "N/A"
        ),
    },
    {
      title: "Training Provider",
      dataIndex: "trainingProvider",
      key: "trainingProvider",
      width: 200,
      render: (value: any, record: any) =>
        isEditing ? (
          <Input
            value={value}
            onChange={(e) =>
              handleFieldChange(record, "trainingProvider", e.target.value)
            }
          />
        ) : (
          value || "N/A"
        ),
    },
    {
      title: "Objectives",
      dataIndex: "trainingObjectives",
      key: "trainingObjectives",
      width: 250,
      render: (value: any, record: any) =>
        isEditing ? (
          <Input.TextArea
            rows={1}
            value={value}
            onChange={(e) =>
              handleFieldChange(record, "trainingObjectives", e.target.value)
            }
          />
        ) : (
          value || "N/A"
        ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 150,
      render: (value: any, record: any) =>
        isEditing ? (
          <DatePicker
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
            onChange={(_, dateString) =>
              handleFieldChange(record, "startDate", dateString)
            }
          />
        ) : (value ? value : "N/A"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      width: 150,
      render: (value: any, record: any) =>
        isEditing ? (
          <DatePicker
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
            onChange={(_, dateString) =>
              handleFieldChange(record, "endDate", dateString)
            }
          />
        ) : (value ? value : "N/A"),
    },

    {
      title: "Fee (USD)",
      dataIndex: "registrationFee",
      key: "registrationFee",
      align: "right" as const,
      width: 130,
      render: (value: any, record: any) =>
        isEditing ? (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              handleFieldChange(
                record,
                "registrationFee",
                parseFloat(e.target.value) || 0
              )
            }
          />
        ) : (
          value?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          }) ?? "N/A"
        ),
    },
    {
      title: "Venue",
      dataIndex: "trainingVenue",
      key: "trainingVenue",
      width: 180,
      render: (value: any, record: any) =>
        isEditing ? (
          <Input
            value={value}
            onChange={(e) =>
              handleFieldChange(record, "trainingVenue", e.target.value)
            }
          />
        ) : (
          value || "N/A"
        ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: any) => (
        <Tooltip title="Delete line">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            loading={deletingLineId === (record.adhocRequestNo || getRowKey(record))}
            onClick={() => handleDeleteLine(record)}
          >
            {deletingLineId === (record.adhocRequestNo || getRowKey(record))
              ? "Deleting..."
              : "Delete"}
          </Button>
        </Tooltip>
      ),
    },
  ];


  return (
    <div>
      {contextHolder}
      <div style={{ position: "relative" }}>
        {(approvalStatus === "loading" || cancelApprovalStatus === "loading") && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
            <Spin size="large" tip="Please wait..." />
          </div>
        )}

        {/* Header */}
        <div className="p-4 mt-4">
          <Descriptions
            title="Requisition Details - Adhoc Training"
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label="Requisition No">
              {requisitonDetails?.requestNo ?? "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Employee Name">
              {requisitonDetails?.employeeName ?? "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {requisitonDetails?.status ?? "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Request Date">
              {dayjs(requisitonDetails?.requestDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Is Adhoc Training?">
              {requisitonDetails?.isAdhoc ? "Yes" : "No"}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Lines */}
        <div className="p-4 mt-4">
          <div className="flex justify-between mb-2">
            <h6 className="text-lg font-semibold">Adhoc Lines</h6>
            <div className="d-flex justify-content-end align-items-center gap-2">
              <Button
                type="primary"
                onClick={() => setIsEditing(!isEditing)}
                icon={<EditOutlined />}
              >
                {isEditing ? "Cancel Edit" : "Edit Lines"}
              </Button>
              {isEditing && (
                <Button type="default" onClick={handleAddLine} icon={<PlusOutlined />}>
                  Add Line
                </Button>
              )}
            </div>
          </div>

          <Table
            bordered
            size="middle"
            className="shadow-sm rounded-lg"
            columns={columns}
            dataSource={localRows}
            rowKey={getRowKey}
            pagination={false}
            scroll={{ x: "max-content" }}
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          />


          {isEditing && localRows.length > 0 && (
            <div className="mt-4 text-right">
              <Button type="primary" onClick={handleSubmitLines}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdhocRequestDocument;
