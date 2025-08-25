import React, { useState } from 'react';
import { Button, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import GeneratePayroll from './GeneratePayroll';

const EmployeePayroll: React.FC = () => {
    const navigate = useNavigate();
    const [isHeaderPinned, setIsHeaderPinned] = useState(true);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSendForApproval = () => {
        console.log('Send for approval');
    };

    const handleCancelApproval = () => {
        console.log('Cancel approval');
    };

    const handleGeneratePayroll = () => {
        console.log('Generating payroll from', startDate, 'to', endDate);
    };

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
           {/* <PageHeader
                title=" Payroll Periods"
                    isPinned={isHeaderPinned}
                    onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                    showActions={true}
                    onSendForApproval={handleSendForApproval}
                    onCancelApproval={handleCancelApproval}
                /> */}

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
