import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { notification, Skeleton, Spin } from "antd";
import {
  selectApprovalApplication,
  sendForApproval,
} from "../../../../features/common/sendforApproval";
import {
  cancelApproval,
  selectCancelApprovalApplication,
} from "../../../../features/common/cancelApprovalReq";
import type { RootState } from "../../../../app/store";
import PageHeader from "../../../../components/PageHeader";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchTrainingDocumentDetails,
  fetchTrainingRequisitions,
} from "../../../../features/trainingMgt/trainingRequisition";
import RegularRequestDocument from "../partials/RegularRequestDocument";
import { useAppDispatch, useAppSelector } from "../../../../hooks/ReduxHooks";

const DocumentView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isHeaderPinned, setIsHeaderPinned] = useState(true);
  const [api, contextHolder] = notification.useNotification();
  const docNo = new URLSearchParams(window.location.search).get("DocumentNo");

  const { documentDetails, dropdowns } = useSelector(
    (state: RootState) => state.trainingRequisition,
  );
  const { status: cancelApprovalStatus } = useAppSelector(
    selectCancelApprovalApplication,
  );
  const { status: approvalStatus } = useAppSelector(selectApprovalApplication);

  useEffect(() => {
    if (docNo) {
      dispatch(fetchTrainingDocumentDetails(docNo));
    }
  }, [dispatch, docNo]);

  const handleSendForApproval = () => {
    if (!docNo) return;

    dispatch(
      sendForApproval({
        docNo,
        endpoint: `/Training/send-approval?docNo=${docNo}`,
      }),
    )
      .unwrap()
      .then((response) => {
        api.success({
          message: "Success",
          description: response.message,
          duration: 3,
          onClose: () => {
            navigate("/Training Management/Training Requisition");
            dispatch(fetchTrainingRequisitions());
          },
        });
      })
      .catch((error) => {
        api.error({
          message: "Error",
          description: error?.message || "Failed to send for approval",
          duration: 3,
        });
      });
  };

  const handleCancelApproval = () => {
    if (!docNo) return;

    dispatch(
      cancelApproval({
        docNo,
        endpoint: `/Training/cancel-approval?docNo=${docNo}`,
      }),
    )
      .unwrap()
      .then((response) => {
        api.success({
          message: "Success",
          description: response.message,
          duration: 3,
          onClose: () => {
            navigate("/Training Management/Training Requisition");
            dispatch(fetchTrainingRequisitions());
          },
        });
      })
      .catch((error) => {
        api.error({
          message: "Error",
          description: error?.message || "Failed to cancel approval",
          duration: 3,
        });
      });
  };

  return (
    <div>
      <PageHeader
        title={`Requisition No: ${documentDetails?.requestNo ?? "N/A"}`}
        isPinned={isHeaderPinned}
        onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
        onSendForApproval={handleSendForApproval}
        onCancelApproval={handleCancelApproval}
      />

      {documentDetails ? (
        <>
          {contextHolder}
          <div style={{ position: "relative" }}>
            {(approvalStatus === "loading" ||
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
                <Spin size="large" tip="Please wait..." />
              </div>
            )}

            <RegularRequestDocument
              requisitonDetails={documentDetails}
              dropdowns={dropdowns}
            />
          </div>
        </>
      ) : (
        <Skeleton paragraph={{ rows: 7 }} active />
      )}
    </div>
  );
};

export default DocumentView;
