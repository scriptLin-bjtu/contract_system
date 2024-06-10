import React, { useState, useEffect } from 'react';
import { Form, Input, message, Button, Upload, DatePicker, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Draft, getUsersByPermission,checkPermission } from '../../services/api.js';

const { Option } = Select;

export default function DraftContract() {
  const [form] = Form.useForm();
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [havePermission,setHavePermission]=useState(false);

  useEffect(() => {
    async function fetchClients() {
		
		
      const result = await getUsersByPermission('all');
      if (result) {
        setClients(result);
      }
	  const r=await checkPermission('can_draft_contract');
	  if(r){
		  setHavePermission(r);
	  }
    }
    fetchClients();
  }, []);

  const handleAddClient = (value) => {
    if (!selectedClients.includes(value)) {
      setSelectedClients([...selectedClients, value]);
    }
  };

  const handleRemoveClient = (client) => {
    setSelectedClients(selectedClients.filter(item => item !== client));
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('client_name', selectedClients.join(';'));
    formData.append('start_date', values.start_date.format('YYYY-MM-DD'));
    formData.append('end_date', values.end_date.format('YYYY-MM-DD'));

    if (values.attachment && values.attachment.length > 0) {
      formData.append('attachment', values.attachment[0].originFileObj);
    }

    const result = await Draft(formData);
    if (result) {
      message.success('合同起草成功');
    } else {
      message.error('合同起草失败');
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <div>
      <h3>起草合同内容</h3>
	  {havePermission?<Form
        form={form}
        name="draft_contract"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="title"
          label="合同标题"
          rules={[{ required: true, message: '请输入合同标题!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="合同描述"
          rules={[{ required: true, message: '请输入合同描述!' }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label="客户名称"
        >
          <Select
            showSearch
            placeholder="选择客户"
            onSelect={handleAddClient}
          >
            {clients.map(client => (
              <Option key={client.id} value={client.username}>
                {client.username}
              </Option>
            ))}
          </Select>
          <div style={{ marginTop: 10 }}>
            {selectedClients.map(client => (
              <div key={client} style={{ display: 'flex', alignItems: 'center' }}>
                <span>{client}</span>
                <Button type="link" onClick={() => handleRemoveClient(client)}>移除</Button>
              </div>
            ))}
          </div>
        </Form.Item>
        <Form.Item
          name="start_date"
          label="开始日期"
          rules={[{ required: true, message: '请选择开始日期!' }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          name="end_date"
          label="结束日期"
          rules={[{ required: true, message: '请选择结束日期!' }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          name="attachment"
          label="附件"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            起草
          </Button>
        </Form.Item>
      </Form>:<h4>没有权限,请联系管理员</h4>}
      
    </div>
  );
}
