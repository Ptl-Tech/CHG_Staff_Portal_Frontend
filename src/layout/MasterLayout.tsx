import React, { Children, useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Layout, Menu, type MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ChiromoLogo from '../assets/images/ChiromoLogo.png';
import zamzamlg from '../assets/images/zamzamlg.jpg';
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
  MenuUnfoldOutlined
} from '@ant-design/icons';
import SignOut from '../auth/SignOut';
// Dummy route definitions (replace with your real ones)
import bgImage from '../assets/images/ChiromoBg.png';
import smallLogo from '../assets/images/smallLogo.png';
import logo from '../assets/images/logo.png';

import { receptionRoutes } from '../components/SideBarLayout';



const MasterLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // MOCK department (replace with real logic: from context, redux, etc.)
  const department = 'Reception';

  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState(location.pathname);


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
    label: <SignOut />,  // no need for extra <div>
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
            }}>U</Avatar>

          </div>
        </Dropdown>

      </Header>

      <Layout style={{ marginTop: 64 }}>
        <Sider
          breakpoint="lg"
          width={250}
          collapsible
          collapsedWidth={0}
          collapsed={collapsed}
          onCollapse={(collapsed) => setCollapsed(collapsed)}

          style={{
            position: "fixed",
            top: 64,
            left: 0,

            overflowY: "auto",
            zIndex: collapsed ? 0 : 100,
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
            items={receptionRoutes.map((route) => ({
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
            marginTop: 64,
            zIndex: 1,
          }}
        >
          <Content style={{ minHeight: 280 }} >
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
