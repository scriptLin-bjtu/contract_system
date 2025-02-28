import React, { useState ,lazy,Suspense} from 'react';
import { message, Button, Layout, Menu } from 'antd';
import { Logout } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
const SearchContract = lazy(()=>import('../components/modules/SearchContract.jsx'));
const ManageDraftContract= lazy(()=>import('../components/modules/ManageDraftContract.jsx'));
const ManageUser= lazy(()=>import('../components/modules/ManageUser.jsx'));
const ManageApproveContract= lazy(()=>import('../components/modules/ManageApproveContract.jsx'));

const { Header, Content } = Layout;

export default function AdminPage() {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('draft-contract');
  
  function logout() {
    const result = Logout();
    if (result) {
      message.success('登出成功');
      navigate('/login');
    }
  }

  const renderContent = () => {
    switch (selectedMenu) {
      case 'manage-draft-contract':
        return <ManageDraftContract />;
      case 'manage-approve-contract':
        return <ManageApproveContract />;
      case 'search-contract':
        return <SearchContract />;
      case 'manage-user':
        return <ManageUser />;
      default:
        return <ManageDraftContract />;
    }
  };

  const menuItems = [
    {
      key: 'manage-draft-contract',
      label: '指定会签人',
    },
    {
      key: 'manage-approve-contract',
      label: '指定审批人',
    },
    {
      key: 'manage-user',
      label: '权限管理',
    },
    {
      key: 'search-contract',
      label: '查询合同',
    },
    {
      key: 'logout',
      label: <Button type="text" onClick={logout} style={{ color: 'white' }}>登出</Button>,
    },
  ];

  return (
    <Layout>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedMenu]}
          onClick={(e) => setSelectedMenu(e.key)}
          items={menuItems}
        />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div>
          <h3>管理员界面</h3>
          <div>
		  <Suspense>{renderContent()}</Suspense>
		  </div>
        </div>
      </Content>
    </Layout>
  );
}
