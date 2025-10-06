import React, { useState } from 'react';
import { Button, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import GeneratePayroll from './GeneratePayroll';

const EmployeePayroll: React.FC = () => {
    const navigate = useNavigate();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

 

    

    const columns = [
        {
            title: 'Employee',
            dataIndex: 'employee',
            key: 'employee',
        },
        {
            title: 'Payroll Period',
            dataIndex: 'period',
            key: 'period',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
    ];

    return (
        <>
         
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <GeneratePayroll
                    startDate={startDate}
                    endDate={endDate}
                    onGeneratePayroll={handleGeneratePayroll}
                />
                <Table columns={columns} dataSource={[]} />
            </Space>
        </>
    );
};

export default EmployeePayroll;
