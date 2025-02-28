import {React} from 'react'; 
import { Button,Form, Input, message } from 'antd';
import {Login} from '../services/api.js';
import { useNavigate } from 'react-router-dom';
export default function LoginPage(){
	const navigate = useNavigate();
	const onFinish = async(values) => {
	  //console.log('Success:', values);
	  const result=await Login(values);
	  if(result){
		  message.success('登陆成功');
		  navigate('/home');
	  }
	};
	const onFinishFailed = (errorInfo) => {
	  console.log('Failed:', errorInfo);
	};
	return (
	<>
	<h3>合同管理系统登陆界面</h3>
	<Form
	    name="basic"
	    labelCol={{
	      span: 8,
	    }}
	    wrapperCol={{
	      span: 16,
	    }}
	    style={{
	      maxWidth: 600,
	    }}
	    onFinish={onFinish}
	    onFinishFailed={onFinishFailed}
	    autoComplete="off"
	  >
	    <Form.Item
	      label="用户名"
	      name="username"
	      rules={[
	        {
	          required: true,
	          message: 'Please input your username!',
	        },
	      ]}
	    >
	      <Input />
	    </Form.Item>
	
	    <Form.Item
	      label="密码"
	      name="password"
	      rules={[
	        {
	          required: true,
	          message: 'Please input your password!',
	        },
	      ]}
	    >
	      <Input.Password />
	    </Form.Item>
	
	    <Form.Item
	      wrapperCol={{
	        offset: 8,
	        span: 16,
	      }}
	    >
	      <Button type="primary" htmlType="submit">
	        登陆
	      </Button>
	    </Form.Item>
	  </Form>
	  <Button type="link" onClick={()=>{navigate('/register')}}>前往注册</Button>
	  </>
	);
}