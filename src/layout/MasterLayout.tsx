import React, { Children, useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Layout, Menu, type MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const { Header, Footer, Sider, Content } = Layout;
import {
  AppstoreOutlined,
  UserOutlined,
  BellOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
  DollarOutlined,
  ReconciliationOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined
} from '@ant-design/icons';
import SignOut from '../auth/SignOut';
// Dummy route definitions (replace with your real ones)
import smallLogo from '../assets/images/smallLogo.png';
import logo from '../assets/images/logo.png';

import { receptionRoutes } from '../components/SideBarLayout';
import { useIdleTimer } from '../utils/useIdleTimer';
import { useAppDispatch } from '../hooks/ReduxHooks';
import { logout } from '../features/auth/authSlice';
import { useDecodedToken } from '../hooks/useDecodedToken';



const MasterLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
const dispatch=useAppDispatch();
 const routes = receptionRoutes(); // Call it like a function

  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  const decodedToken = useDecodedToken();
  const staffName = decodedToken?.staffName;

  const getInitials = (name: string | undefined) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const initials = getInitials(staffName);

  useIdleTimer(() => {
   dispatch(logout());
    navigate("/login");
  }, 1000 * 60 * 30); // 30 minutes


  useEffect(() => {
    // Set the initial open keys based on the current path
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      setOpenKeys([`/${pathParts[0]}`]);
    }
  }, [location.pathname]);

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys.length === 0 ? [] : [keys[keys.length - 1]]);
  };

const items: MenuProps["items"] = [
  {
    key: "1",
    label: <SignOut />, 
  },
];

  

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="headerDashboard shadow-sm"
        style={{
          //background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 20,
              // color: "#013289",
              color: "#ffffff",
            }}
          />
          <img src={logo} alt="Logo" style={{ width: "120px", height: "auto" }} />
        </div>
        <Dropdown menu={{items}} trigger={["click"]}>
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <Avatar style={{
              borderColor: "#ffffff",
              //  backgroundColor: "#013289"
            }}>{initials}</Avatar>
          <DownOutlined style={{ color: "#ffffff", marginLeft: 8 }}/>

          </div>
        </Dropdown>

      </Header>

      <Layout style={{ marginTop: 64 }}>
        <Sider
          breakpoint="lg"
          width={250}
          collapsible
          collapsedWidth={80}
          collapsed={collapsed}
          onCollapse={(collapsed) => setCollapsed(collapsed)}

          style={{
            position: "fixed",
            top: 64,
            left: 0,

            overflowY: "auto",
            zIndex: collapsed ? 0 : 1,
            //  background: "#001529",
          }}
        >
          <Menu
            theme='dark'
            className="shadow-sm custom-sider"
            mode="inline"
            defaultSelectedKeys={["/"]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            onClick={({ key }) => navigate(key)}
            items={routes.map((route) => ({
              key: route.key,
              label: route.label,
              icon: route.icon,
              children: route.children?.map((child) => ({
                key: child.key,
                icon: child.icon,
                label: child.label,
              })),
            }))}

          />

        </Sider>
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 250,
            transition: "all 0.2s",
            padding: 24,
            background: "#fff",
            height: "100vh",
            overflowY: "auto",
            marginTop: 24,
            zIndex: 1,
          }}
        >
          <Content style={{ zIndex: 0 }} >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <Footer style={{ textAlign: 'center', marginBottom: "0" }}>
        Chiromo StaffPortal ©{new Date().getFullYear()} Powered by PTL
      </Footer>

    </Layout>

  );
};

export default MasterLayout;
