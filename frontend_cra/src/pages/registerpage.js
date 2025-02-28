import {React} from 'react'; 
import { Button,Form, Input, message,Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import {Register} from '../services/api.js';
const {Option} = Select;
export default function LoginPage(){
	
	const navigate = useNavigate();
	const onFinish = async(values) => {
	  //console.log('Success:', values);
	  const result=await Register(values);
	  if(result){
		  message.success(result);
		  navigate('/login');
	  }
	};
	const onFinishFailed = (errorInfo) => {
	  console.log('Failed:', errorInfo);
	};
	return (
	<>
	<h3>合同管理系统注册界面</h3>
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
		  label="确认密码"
		  name="confirmPassword"
		  rules={[
		    {
		      required: true,
		      message: 'Please input your confirmPassword!',
		    },
		  ]}
		>
		  <Input.Password />
		</Form.Item>
		<Form.Item
		          label="身份"
		          name="role"
		          rules={[{ required: true, message: 'Please select your role!' }]}
		        >
		          <Select placeholder="Select a role">
		            <Option value="user">操作员</Option>
		            <Option value="admin">管理员</Option>
		          </Select>
		        </Form.Item>
	    <Form.Item
	      wrapperCol={{
	        offset: 8,
	        span: 16,
	      }}
	    >
	      <Button type="primary" htmlType="submit">
	        注册
	      </Button>
	    </Form.Item>
	  </Form>
	  <Button type="link" onClick={()=>{navigate('/login')}}>前往登陆</Button>
	  </>
	);
}