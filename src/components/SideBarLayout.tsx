import {
    AppstoreOutlined,
    FileTextOutlined,
    FileDoneOutlined,
    TeamOutlined,
    ReconciliationOutlined,
    SettingOutlined,
    DollarOutlined,
    TagsOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    CarOutlined,
} from '@ant-design/icons';

export const receptionRoutes = [
    {
        key: '/',
        icon: <AppstoreOutlined />,
        label: 'Dashboard',
    },
    {
        key: '/Leave Application',
        icon: <FileTextOutlined />,
        label: 'Human Resource',
        children: [
            {
                key: 'Leave Application/Leave-List',
                icon: <FileTextOutlined />,
                label: 'Leave Requisition List',
            },
            {
                key: 'Leave Application/leave-Statement',
                icon: <FileTextOutlined />,
                label: 'Leave Statement',
            },
        ],
    },
    {
        key: '/payroll',
        icon: <DollarOutlined />,
        label: 'Payroll',
        children: [
            {
                key: 'payroll/Payslip',
                icon: <DollarOutlined />,
                label: 'Payslip',
            },
            // {
            //     key: '/payroll/p9',
            //     icon: <DollarOutlined />,
            //     label: 'P9 Form',
            // },
        ],
    },
    // {
    //     key: '/training',
    //     icon: <ReconciliationOutlined />,
    //     label: 'Training Management',
    //     children: [
    //         {
    //             key: '/training/requisition',
    //             icon: <ReconciliationOutlined />,
    //             label: 'Training Requisition',
    //         },
    //         {
    //             key: '/training/evaluation',
    //             icon: <ReconciliationOutlined />,
    //             label: 'Training Evaluation',
    //         },
    //         {
    //             key: '/training/post-evaluation',
    //             icon: <ReconciliationOutlined />,
    //             label: 'Post Training Evaluation',
    //         },
    //     ],
    //  },
    // {
    //     key: '/performance',
    //     icon: <SettingOutlined />,
    //     label: 'Performance Management',
    //     children: [
    //         {
    //             key: '/performance/scorecard',
    //             icon: <ReconciliationOutlined />,
    //             label: 'Balance Scorecard',
    //         },
    //     ],
    // },
    // 
    // {
    //     key: '/procurement',
    //     icon: <ShoppingCartOutlined />,
    //     label: 'Procurement Management',
    //     children: [
    //         {
    //             key: '/procurement/store-requisition',
    //             icon: <ShoppingCartOutlined />,
    //             label: 'Store Requisition',
    //         },
    //         {
    //             key: '/procurement/purchase-requisition',
    //             icon: <TagsOutlined />,
    //             label: 'Purchase Requisition',
    //         },
    //     ],
    // },
    // {
    //     key: '/finance',
    //     icon: <ReconciliationOutlined />,
    //     label: 'Finance',
    //     children: [
    //         {
    //             key: '/finance/Travel-advance-list',
    //             icon: <ReconciliationOutlined />,
    //             label: 'Travel Advance',
    //         },

    //         {
    //             key: '/finance/Advance-surrender-list',
    //             icon: <ReconciliationOutlined />,
    //             label: 'Imprest Surrender',
    //         },
    //         {
    //             key: '/finance/Staff-Claim-list',
    //             icon: <DollarOutlined />,
    //             label: 'Staff Claim',
    //         }

    //     ],
    // },
    // {
    //     key: '/logistics',
    //     icon: <CarOutlined />,
    //     label: 'Travel Requests',
    //     children: [
    //         {
    //             key: '/logistics/Vehicle-Requests',
    //             icon: <CarOutlined />,
    //             label: 'Vehicle Requests'
    //         },
    //         {
    //             key: '/logistics/Travel-Requisition',
    //             icon: <FileDoneOutlined />,
    //             label: 'Travel Requests'
    //         }
    //     ]

    // },
    // {
    //     key: '/approvals',
    //     icon: <FileDoneOutlined />,
    //     label: 'Approval Management',
    //     children: [
    //         {
    //             key: '/approvals/pending',
    //             icon: <FileDoneOutlined />,
    //             label: 'Pending My Approval',
    //         },
    //         {
    //             key: '/approvals/approved',
    //             icon: <FileDoneOutlined />,
    //             label: 'Approved Documents',
    //         },
    //         {
    //             key: '/approvals/rejected',
    //             icon: <FileDoneOutlined />,
    //             label: 'Rejected Documents',
    //         },
    //     ],
    // },
    // {
    //     key: '/supervisor',
    //     icon: <TeamOutlined />,
    //     label: 'Supervisor Section',
    //     children: [
    //         {
    //             key: '/supervisor/employees',
    //             icon: <UserOutlined />,
    //             label: 'Departmental Employees',
    //         },
    //         {
    //             key: '/supervisor/leave',
    //             icon: <FileTextOutlined />,
    //             label: 'Departmental Leave',
    //         },
    //         {
    //             key: '/supervisor/shifts',
    //             icon: <SettingOutlined />,
    //             label: 'Shift Management',
    //         },
    //     ],
    // },
    // {
    //     key: '/documents',
    //     icon: <FileTextOutlined />,
    //     label: 'Documentation Management',
    //     children: [
    //         {
    //             key: '/documents/policies',
    //             icon: <FileTextOutlined />,
    //             label: 'Policies',
    //         },
    //         {
    //             key: '/documents/sops',
    //             icon: <FileTextOutlined />,
    //             label: 'SOPs',
    //         },
    //         {
    //             key: '/documents/forms',
    //             icon: <FileTextOutlined />,
    //             label: 'Forms',
    //         },
    //     ],
    // },
    // {
    //     key: '/clearance',
    //     icon: <FileDoneOutlined />,
    //     label: 'Clearance',
    // },
    {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Settings',
        children: [
            {
                key: '/settings/change-password',
                icon: <UserOutlined />,
                label: 'Change Password',
            },
        ],
    },
]
