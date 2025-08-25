// src/features/leave/RequestModal.tsx
import React from 'react';
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

const { Option } = Select;

interface Props {
  employeeData: any;
}


const EmployeesonLeave: React.FC <Props> = ({ employeeData}) => {
    const [form] = Form.useForm();
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
          
        <Table bordered size='small' columns={columns}           dataSource={employeeData?.map((emp: any) => ({ ...emp, key: emp.leaveNo }))} 
       
        />
      </Space>
        </Card>
    );
};

export default EmployeesonLeave;
