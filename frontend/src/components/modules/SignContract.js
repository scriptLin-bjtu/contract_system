import React, { useState, useEffect } from 'react';
import { message, Button, List, Modal, Form, Input } from 'antd';
import { GetPendingSignContracts, SubmitSignContract } from '../../services/api.js';

export default function SignContract() {
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchContracts = async () => {
            const result = await GetPendingSignContracts();
            if (result) {
                setContracts(result);
            } else {
                message.error('获取待签定合同列表失败');
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
            const result = await SubmitSignContract({
                contractId: selectedContract.id,
                comment: values.comment
            });
            if (result) {
				message.success('签署成功');
                setIsModalVisible(false);
                form.resetFields();
                const updatedContracts = await GetPendingSignContracts();
                if (updatedContracts) {
                    setContracts(updatedContracts);
                } else {
                    message.error('获取待签定合同列表失败');
                }
            } else {
                message.error('提交签定信息失败');
            }
        } catch (error) {
            console.error('提交签定信息失败：', error);
        }
    };

    return (
        <div>
            <h3>待签定合同列表</h3>
            <List
                dataSource={contracts}
                renderItem={(contract) => (
                    <List.Item actions={[<Button onClick={() => handleOpenModal(contract)}>签定合同</Button>]}>
                        <List.Item.Meta
                            title={contract.title}
                            description={contract.description}
                        />
                    </List.Item>
                )}
            />
            <Modal
                title="签定合同"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form}>
                    <Form.Item
                        name="comment"
                        label="签定信息"
                        rules={[{ required: true, message: '请输入签定信息' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}