import React,{useState} from 'react';
import { message,Button,Layout, Menu } from 'antd';
import {Logout} from '../services/api.js'
import { useNavigate } from 'react-router-dom';
import SearchContract from '../components/modules/SearchContract.js';
import ManageDraftContract from '../components/modules/ManageDraftContract.js';
import ManageUser from '../components/modules/ManageUser.js';
import ManageApproveContract from '../components/modules/ManageApproveContract.js'
const { Header, Content } = Layout;

export default function AdminPage(){
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
	      case 'manage-draft-contract':
	        return <ManageDraftContract />;
	      case 'manage-approve-contract':
	        return <ManageApproveContract />;
			case 'search-contract':
			  return <SearchContract />;
		case 'manage-user':
			return <ManageUser/>
	      default:
	        return <ManageDraftContract />;
	    }
	  };
	return(
	<>
	<Layout>
	  <Header>
	    <Menu
		theme="dark"
		          mode="horizontal"
		          selectedKeys={[selectedMenu]}
		          onClick={(e) => setSelectedMenu(e.key)}
	    >
	      <Menu.Item key="manage-draft-contract">指定会签人</Menu.Item>
	      <Menu.Item key="manage-approve-contract">指定审批人</Menu.Item>
		  <Menu.Item key="manage-user">权限管理</Menu.Item>
		  <Menu.Item key="search-contract">查询合同</Menu.Item>
		  <Menu.Item key="logout"><Button type='text' onClick={logout} style={{color:'white'}}>登出</Button></Menu.Item>
	    </Menu>
	  </Header>
	  <Content style={{ padding: '0 50px'}}>
	    <div>
	      <h3>管理员界面</h3>
	      <div>{renderContent()}</div>
	    </div>
	  </Content>
	</Layout>
	</>
	);
}