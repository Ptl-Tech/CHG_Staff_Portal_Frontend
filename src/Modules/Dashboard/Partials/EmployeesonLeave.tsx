// src/features/leave/RequestModal.tsx
import React, { useEffect } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Row,
    Col,
    Select,
    Button,
    Modal,
    Table,
    Space,
    Typography,
    Card
} from 'antd';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { fetchUserData, selectFetchDashboardData } from '../../../features/dashboard/dashboardRequest';

const { Option } = Select;

interface Props {
  employeeData: any;
}


const EmployeesonLeave = () => {
    const [form] = Form.useForm();
    const dispatch=useAppDispatch();
      const { dashboardDetails, status, error } = useAppSelector(selectFetchDashboardData);
    const employeeData=dashboardDetails?.employeesOnLeave;
        useEffect(() => {
           dispatch(fetchUserData());
        }, [dispatch]);
console.log('employeeData', employeeData);
   const columns=[
    {
      title:"#",
      dataIndex: 'id',
      key: 'id',
      render: (_: any, __: any, index: number) => index + 1
    },
     {
      title: 'Employee Name',
      dataIndex: 'staffName',
      key: 'staffName',
    },   
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Leave Days',
      dataIndex: 'leaveDays',
      key: 'leaveDays',
    },
     {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
    },
    {
        title: 'Reliever Name',
        dataIndex: 'reliever',
        key: 'reliever',
    }
   ]

    return (
        <Card style={{ width: '100%', marginTop: '20px' }}>
             <Typography.Text strong underline>
            Employees on Leave
          </Typography.Text>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          
        <Table bordered size='small' columns={columns}   loading={status === 'loading'}         dataSource={employeeData?.map((emp: any) => ({ ...emp, key: emp.leaveNo }))} 
       
        />
      </Space>
        </Card>
    );
};

export default EmployeesonLeave;
