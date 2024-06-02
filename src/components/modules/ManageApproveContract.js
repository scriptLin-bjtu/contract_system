import React,{useEffect, useState} from 'react';
import { message,Button,List,Form,Modal,Input} from 'antd';
import {GetApprovalList, SetContractApprover} from '../../services/api.js';

export default function ManageApproveContract() {
	const [approvecontracts, setApprovecontracts] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [currentContract, setCurrentContract] = useState(null);
	const [form] = Form.useForm();
	useEffect(()=>{
		const fetchList = async () => {
		    const result=await GetApprovalList();
			if(result){
				//console.log(result);
				setApprovecontracts(result);
			}else{
				console.log('获取列表失败');
			}
		};
		fetchList();
		
	},[]);
	const showModal = (contract) => {
        setCurrentContract(contract);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            console.log('指定审批人:', values.signers);
			const formdata={id:currentContract.id,userId:values.signers};
			const result=await SetContractApprover(formdata);
			if(result){
				message.success(result);
			}
            setIsModalVisible(false);
            form.resetFields();
			const r=await GetApprovalList();
			if(r){
				setApprovecontracts(r);
			}
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };
   return (
        <div>
            <h3>指定审批人</h3>
            <List
                itemLayout="horizontal"
                dataSource={approvecontracts}
                renderItem={contract => (
                    <List.Item
                        actions={[<Button type="primary" onClick={() => showModal(contract)}>指定审批人</Button>]}
                    >
                        <List.Item.Meta
                            title={contract.title}
                            description={contract.description}
                        />
                        <div>客户名称: {contract.client_name}</div>
                        <div>创建时间: {new Date(contract.created_at).toLocaleString()}</div>
                    </List.Item>
                )}
            />
            <Modal
                title="指定审批人"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="signers"
                        label="审批人"
                        rules={[{ required: true, message: '请输入审批人' }]}
                    >
                        <Input placeholder="输入审批人用户名" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
      );
}