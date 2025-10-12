// src/features/leave/DepartmentalEmployees.tsx
import React, { useEffect } from 'react';
import { Table, Space, Typography, Card } from 'antd';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../hooks/ReduxHooks';
import { fetchEmployeeList, selectStaffList } from '../../../features/common/commonSetups';
import { useDecodedToken } from '../../../hooks/useDecodedToken';

const DepartmentalEmployees: React.FC = () => {
    const decodedToken = useDecodedToken();
    const staffNo = decodedToken?.nameid;

    const dispatch = useAppDispatch();
    const {staffList} = useAppSelector(selectStaffList); // ✅ don’t destructure here

    // Find current user's department
    const departmentName = staffList?.find(
        (item: any) => item.employeeNo === staffNo
    )?.globalDimension2;
    const globalDimension1 = staffList?.find(
        (item: any) => item.employeeNo === staffNo
    )?.globalDimension1;

    // Filter employees in the same department
    const filteredStaffList = staffList?.filter(
        (item: any) => item.globalDimension2 === departmentName && item.globalDimension1 === globalDimension1 && item.employeeNo !== staffNo
    );
    console.log("staffNo", staffNo);

    useEffect(() => {
        dispatch(fetchEmployeeList());
    }, [dispatch]);

    const columns = [
        {
            title: "#",
            key: "index",
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Employee No",
            dataIndex: "employeeNo",
            key: "employeeNo",
        },
        {
            title: "Full Name",
            key: "fullName",
            render: (record: any) =>
                `${record.firstName?.trim() || ""} ${record.middleName?.trim() || ""} ${record.lastName?.trim() || ""}`,
        },
        {
            title: "Gender",
            dataIndex: "gender",
            key: "gender",
            render: (gender: string) => gender || "N/A",
        },
        {
            title: "Department",
            dataIndex: "globalDimension2",
            key: "globalDimension2",
            render: (text: string) => text || "N/A",
        },
        {
            title: "Business Unit",
            dataIndex: "globalDimension1",
            key: "globalDimension1",
            render: (text: string) => text || "N/A",
        },
        {
            title: "Company Email",
            dataIndex: "companyEmail",
            key: "companyEmail",
            render: (email: string) => email || "—",
        },
        {
            title: "Employment Date",
            dataIndex: "employmentDate",
            key: "employmentDate",
            render: (date: string) =>
                date && date !== "0001-01-01T00:00:00"
                    ? moment(date).format("DD/MM/YYYY")
                    : "N/A",
        },
    ];

    return (
        <Card style={{ width: '100%', marginTop: 20 }}>
            <Typography.Text strong underline>
                Departmental Employees
            </Typography.Text>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Table
                    bordered
                    size="small"
                    rowKey="employeeNo"
                    columns={columns}
                    loading={!staffList}
                    dataSource={filteredStaffList || []}
                    pagination={{ pageSize: 5 }}
                />
            </Space>
        </Card>
    );
};

export default DepartmentalEmployees;
