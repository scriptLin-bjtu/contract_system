import React, { useState, useEffect } from 'react';
import { message, Button, List, Modal, Form, Input} from 'antd';
import { GetPendingContracts, SubmitCountersign } from '../../services/api.js';
import { useSelector } from 'react-redux';


export default function PendingContract() {
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
	const {can_countersign_contract}=useSelector((state) => state.userPermission.permission);
    useEffect(() => {
        const fetchContracts = async () => {
            const result = await GetPendingContracts();
            if (result) {
                //console.log(result);
                setContracts(result);
            } else {
                message.error('获取待会签合同列表失败');
            }
        };
        fetchContracts();
    }, []);

    const handleOpenModal = (contract) => {
        setSelectedContract(contract);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const result = await SubmitCountersign({
                contractId: selectedContract.id,
                comment: values.comment,
                status: "approved",
            });
            if (result) {
                message.success(result);
                setIsModalVisible(false);
                form.resetFields();
                const r = await GetPendingContracts();
                if (r) {
                    setContracts(r);
                } else {
                    message.error('获取待会签合同列表失败');
                }
            } else {
                message.error('提交会签意见失败');
            }
        } catch (error) {
            console.error('提交会签意见失败：', error);
        }
    };

    return (
        <div>
		{can_countersign_contract?<>
		<h3>待会签合同列表</h3>
		
		<List
		    dataSource={contracts}
		    renderItem={(contract) => (
		        <List.Item actions={[<Button onClick={() => handleOpenModal(contract)}>填写会签意见</Button>]}>
		            <List.Item.Meta
		                title={contract.title}
		                description={(
		                    <div>
		                        <p>{contract.description}</p>
		                        <p>开始日期: {contract.start_date}</p>
		                        <p>结束日期: {contract.end_date}</p>
		                        {contract.attachment && (
		                            <a href={`http://localhost:3001${contract.attachment}`} download>
		                                下载附件
		                            </a>
		                        )}
		                    </div>
		                )}
		            />
		        </List.Item>
		    )}
		/>
		<Modal
		    title="填写会签意见"
		    open={isModalVisible}
		    onOk={handleOk}
		    onCancel={handleCancel}
		>
		    <Form form={form}>
		        <Form.Item
		            name="comment"
		            label="会签意见"
		            rules={[{ required: true, message: '请输入会签意见' }]}
		        >
		            <Input.TextArea rows={4} />
		        </Form.Item>
		    </Form>
		</Modal>
		</>:<h4>没有权限,请联系管理员</h4>}
            
        </div>
    );
}
