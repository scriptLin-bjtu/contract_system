import React, { useState,lazy, Suspense } from 'react';
import {message, Button, Layout, Menu } from 'antd';
import { Logout } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
const  DraftContract = lazy(()=>import('../components/modules/DraftContract.jsx'));
const  ApproveContract =lazy(()=>import('../components/modules/ApproveContract.jsx'));
const  FinalizeContract =lazy(()=>import('../components/modules/FinalizeContract.jsx'));
const  PendingContract = lazy(()=>import('../components/modules/PendingContract.jsx'));
const  SearchContract =lazy(()=>import('../components/modules/SearchContract.jsx'));
const  SignContract =lazy(()=>import('../components/modules/SignContract.jsx'));

const { Header, Content } = Layout;

export default function UserPage() {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('draft-contract');
  
  async function logout() {
    const result = await Logout();
    if (result) {
      message.success('登出成功');
      navigate('/login');
    }
  }

  const renderContent = () => {
    switch (selectedMenu) {
      case 'draft-contract':
        return <DraftContract />;
      case 'pending-contract':
        return <PendingContract />;
      case 'finalize-contract':
        return <FinalizeContract />;
      case 'approve-contract':
        return <ApproveContract />;
      case 'sign-contract':
        return <SignContract />;
      case 'search-contract':
        return <SearchContract />;
      default:
        return <DraftContract />;
    }
  };

  // 修改后的 Menu 配置
  const menuItems = [
    { key: 'draft-contract', label: '起草合同' },
    { key: 'pending-contract', label: '会签合同' },
    { key: 'finalize-contract', label: '定稿合同' },
    { key: 'approve-contract', label: '审批合同' },
    { key: 'sign-contract', label: '签订合同' },
    { key: 'search-contract', label: '查询合同' },
    {
      key: 'logout',
      label: (
        <Button type="text" onClick={logout} style={{ color: 'white' }}>
          登出
        </Button>
      ),
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
          <h3>操作员界面</h3>
          <div>
		  <Suspense>{renderContent()}</Suspense>
		  </div>
        </div>
      </Content>
    </Layout>
  );
}
