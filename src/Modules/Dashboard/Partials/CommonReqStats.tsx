import React from 'react';
import { Card, Typography, List } from 'antd';
import type { UserData } from '../../../types/dashboardState';

interface Props {
  userData: UserData;
}

const CommonReqStats: React.FC<Props> = ({ userData }) => {
  const pendingApprovalData = [
     { requestType: 'Imprest Requests', count: userData.advancePendingApprovalCount },
    // { requestType: 'Advance Surrenders', count: userData.advanceSurrenderCount },
    // { requestType: 'Staff Claims', count: userData.staffClaimCount },
    { requestType: 'Leave Applications', count: userData.pendingApprovalLeaves },
    // { requestType: 'Training Requests', count: userData.trainingRequests },
    // { requestType: 'Purchase Requests', count: userData.purchaseRequests },
    // { requestType: 'Travel Requests', count: userData.travelRequests }
  ];

  const openRequestsData = [
     { requestType: 'Imprest Requests', count: userData.advanceCount },
    // { requestType: 'Advance Surrenders', count: userData.openAdvanceSurrenderCount },
    // { requestType: 'Staff Claims', count: userData.openStaffClaimCount },
    { requestType: 'Leave Applications', count: userData.appliedLeaves },
    // { requestType: 'Training Requests', count: userData.opentrainingRequests },
    // { requestType: 'Purchase Requests', count: userData.openPurchaseRequests },
    // { requestType: 'Travel Requests', count: userData.openTravelRequests }
  ];

  const renderList = (title: string, data: typeof pendingApprovalData) => (
    <div style={{ flex: 1, paddingRight: 10 }}>
      <Typography.Text strong underline>
        {title}
      </Typography.Text>
      <List
        size="small"
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.requestType}</span>
            <Typography.Text strong>{item.count}</Typography.Text>
          </List.Item>
        )}
        style={{ marginTop: 10 }}
      />
    </div>
  );

  return (
    <Card style={{ width: '100%', marginTop: 20 }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {renderList('Pending Approval', pendingApprovalData)}
        {renderList('Open Requests', openRequestsData)}
      </div>
    </Card>
  );
};

export default CommonReqStats;
