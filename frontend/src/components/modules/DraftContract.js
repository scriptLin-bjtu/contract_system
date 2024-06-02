import React from 'react';
import { Form, Input, message, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Draft } from '../../services/api.js';

export default function DraftContract() {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('client_name', values.client_name);

    if (values.attachment && values.attachment.length > 0) {
      formData.append('attachment', values.attachment[0].originFileObj);
    }

    //console.log([...formData]); // 打印 FormData 内容用于调试

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
      <Form
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
          name="client_name"
          label="客户名称"
          rules={[{ required: true, message: '请输入客户名称!' }]}
        >
          <Input />
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
      </Form>
    </div>
  );
}
