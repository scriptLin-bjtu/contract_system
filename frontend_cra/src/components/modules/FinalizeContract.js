import React, { useState, useEffect } from 'react';
import { message, Button, List, Modal, Form, Input, Select } from 'antd';
import { GetFinalDrafts, SubmitFinalDraft, getUsersByPermission,checkPermission } from '../../services/api.js';


const { Option } = Select;

export default function FinalizeContract() {
    const [contracts, setContracts] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
	const [selectedClients, setSelectedClients] = useState([]);
	const [havePermission,setHavePermission]=useState(false);
    useEffect(() => {
        const fetchContracts = async () => {
            const result = await GetFinalDrafts();
            if (result) {
                setContracts(result);
            } else {
                message.error('获取待定稿合同列表失败');
            }
			const r=await checkPermission('can_finalize_contract');
			if(r){
					  setHavePermission(r);
			}
        };

        const fetchClients = async () => {
            const result = await getUsersByPermission('all'); // 获取所有用户
            if (result) {
                setClients(result);
            } else {
                message.error('获取客户列表失败');
            }
        };

        fetchContracts();
        fetchClients();
    }, []);

    const handleOpenModal = (contract) => {
        setSelectedContract(contract);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };
	
	const handleAddClient = (value) => {
	  if (!selectedClients.includes(value)) {
	    setSelectedClients([...selectedClients, value]);
	  }
	};
	
	const handleRemoveClient = (client) => {
	  setSelectedClients(selectedClients.filter(item => item !== client));
	};
	

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const result = await SubmitFinalDraft({
				contractId:selectedContract.id,
				title:values.title,
				description:values.description,
				clientName:selectedClients.join(';'),
				changeDescription:values.changeDescription
			});
            if (result) {
                message.success(result);
                setIsModalVisible(false);
                form.resetFields();
                const r = await GetFinalDrafts();
                if (r) {
                    setContracts(r);
                } else {
                    message.error('获取待定稿合同列表失败');
                }
            } else {
                message.error('提交定稿失败');
            }
        } catch (error) {
            console.error('提交定稿失败：', error);
        }
    };

    return (
        <div>
            
			{havePermission?<>
			<h3>待定稿合同列表</h3>
			<List
			    dataSource={contracts}
			    renderItem={(contract) => (
			        <List.Item actions={[<Button onClick={() => handleOpenModal(contract)}>定稿</Button>]}>
			            <List.Item.Meta
			                title={contract.title}
			                description={(
			                    <>
			                        <p>{contract.description}</p>
			                        <p>开始日期: {contract.start_date}</p>
			                        <p>结束日期: {contract.end_date}</p>
			                        <ul>
			                            {contract.signatures.map(signature => (
			                                <li key={signature.username}>
			                                    {signature.username}: {signature.comment} ({signature.status})
			                                </li>
			                            ))}
			                        </ul>
			                        {contract.attachment && (
			                            <a href={`http://localhost:3001${contract.attachment}`} download>
			                                下载附件
			                            </a>
			                        )}
			                    </>
			                )}
			            />
			        </List.Item>
			    )}
			/>
			<Modal
			    title="定稿"
			    open={isModalVisible}
			    onOk={handleOk}
			    onCancel={handleCancel}
			>
			    <Form form={form} initialValues={selectedContract}>
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
			            name="changeDescription"
			            label="修改说明"
			            rules={[{ required: true, message: '请输入修改说明' }]}
			        >
			            <Input.TextArea rows={4} />
			        </Form.Item>
			    </Form>
			</Modal>
			</>:<h4>没有权限,请联系管理员</h4>}
            
        </div>
    );
}
