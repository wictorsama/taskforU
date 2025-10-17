import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Button, Space } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined, 
  UnorderedListOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleMenuClick = (key: string) => {
    navigate(key);
    // Fechar sidebar em mobile após navegar
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={200} 
        theme="dark"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        trigger={null}
        style={{
          position: isMobile ? 'fixed' : 'relative',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ 
          padding: collapsed ? '16px 8px' : '16px', 
          color: 'white', 
          textAlign: 'center', 
          borderBottom: '1px solid #333',
          overflow: 'hidden'
        }}>
          {!collapsed && <h3 style={{ color: 'white', margin: 0 }}>TaskForU</h3>}
          {collapsed && <h3 style={{ color: 'white', margin: 0, fontSize: '14px' }}>T</h3>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            {
              key: '/dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard'
            },
            {
              key: '/tasks',
              icon: <UnorderedListOutlined />,
              label: 'Tarefas'
            }
          ]}
        />
      </Sider>
      
      {/* Overlay para mobile quando sidebar está aberta */}
      {isMobile && !collapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 999,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 0) }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{
              fontSize: '16px',
              width: 40,
              height: 40,
            }}
          />
          <Space size="small">
            <span style={{ 
              display: isMobile ? 'none' : 'inline',
              fontSize: '14px'
            }}>
              Olá, {user?.name}
            </span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ 
          margin: isMobile ? '8px' : '24px 0 24px 16px', 
          padding: isMobile ? '16px' : '24px', 
          background: '#fff',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;