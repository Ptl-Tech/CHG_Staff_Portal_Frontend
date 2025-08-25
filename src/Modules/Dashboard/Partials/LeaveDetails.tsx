import React from 'react';
import { Col, Row, Statistic, Typography, Card } from 'antd';
import {
  LikeOutlined,
  HourglassOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { UserData } from '../../../types/dashboardState';

interface Props {
  userData:UserData
}

const LeaveDetails: React.FC<Props> = ({ userData}) => {
  console.log('userdata', userData);
  return (
    <Card >
      <Row>
        <Col span={24}>
          <Typography.Text strong underline>
            Leave Details
          </Typography.Text>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Annual Leave Balance"
            value={userData.allLeaveBalance?.toFixed(2)}
            prefix={<LikeOutlined style={{ color: '#1890ff' }} />}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="Pending Approval Leave Requests"
            value={userData.openLeaveApplication}
            prefix={<HourglassOutlined style={{ color: '#faad14' }} />}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="Approved Leave Requests"
            value={userData.appliedLeaves}
           // suffix="/ 100"
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default LeaveDetails;
