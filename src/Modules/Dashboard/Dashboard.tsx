import { Col, Layout, Row, Skeleton, Typography } from 'antd'; 
import React, { useEffect } from 'react';
import LeaveDetails from './Partials/LeaveDetails';
import EmployeesonLeave from './Partials/EmployeesonLeave';
import CommonReqStats from './Partials/CommonReqStats';
import { useAppDispatch, useAppSelector } from '../../hooks/ReduxHooks';
import { fetchUserData, selectFetchDashboardData } from '../../features/dashboard/dashboardRequest';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { dashboardDetails, status, error } = useAppSelector(selectFetchDashboardData);

    useEffect(() => {
       dispatch(fetchUserData());
    }, [dispatch]);

    return (
        <>
           {status==='pending'?(
<Skeleton active paragraph={{ rows: 7 }} />
           ):(error?(
<Typography.Text>{error}</Typography.Text>
           ):(
             <Row gutter={16}>
                <Typography.Text style={{ paddingLeft: 10 }} strong underline>
                    Dashboard
                </Typography.Text>

                <Col span={24}>
                    <LeaveDetails userData={dashboardDetails} />
                </Col>
                 <Col span={24}>
                    <CommonReqStats userData={dashboardDetails} />
                </Col>
                
               
            </Row>
           ))}
        </>
    );
};

export default Dashboard;
