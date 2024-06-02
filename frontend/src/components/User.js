import React,{useState} from 'react';
import { message,Button,Layout, Menu } from 'antd';
import {Logout} from '../services/api.js'
import { useNavigate } from 'react-router-dom';
import DraftContract from '../components/modules/DraftContract.js';
import ApproveContract from '../components/modules/ApproveContract.js';
import FinalizeContract from '../components/modules/FinalizeContract.js';
import PendingContract from '../components/modules/PendingContract.js';
import SearchContract from '../components/modules/SearchContract.js';
import SignContract from '../components/modules/SignContract.js';
const { Header, Content } = Layout;
export default function UserPage(){
	const navigate = useNavigate();
	const [selectedMenu, setSelectedMenu] = useState('draft-contract');
	function logout(){
		const result=Logout();
		if(result){
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
	return (
	    <Layout>
	      <Header>
	        <Menu
			theme="dark"
			          mode="horizontal"
			          selectedKeys={[selectedMenu]}
			          onClick={(e) => setSelectedMenu(e.key)}
	        >
	          <Menu.Item key="draft-contract">起草合同</Menu.Item>
	          <Menu.Item key="pending-contract">会签合同</Menu.Item>
	          <Menu.Item key="finalize-contract">定稿合同</Menu.Item>
	          <Menu.Item key="approve-contract">审批合同</Menu.Item>
	          <Menu.Item key="sign-contract">签订合同</Menu.Item>
			  <Menu.Item key="search-contract">查询合同</Menu.Item>
			  <Menu.Item key="logout"><Button type='text' onClick={logout} style={{color:'white'}}>登出</Button></Menu.Item>
	        </Menu>
	      </Header>
	      <Content style={{ padding: '0 50px'}}>
	        <div>
	          <h3>操作员界面</h3>
	          <div>{renderContent()}</div>
	        </div>
	      </Content>
	    </Layout>
	  );
}