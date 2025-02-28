import React, { useEffect, useState } from 'react';
import { message, Button, List, Form, Modal, Select } from 'antd';
import { GetApprovalList, SetContractApprover, getUsersByPermission } from '../../services/api.js';

const { Option } = Select;

export default function ManageApproveContract() {
    const [approveContracts, setApproveContracts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentContract, setCurrentContract] = useState(null);
    const [form] = Form.useForm();
    const [approvers, setApprovers] = useState([]);

    useEffect(() => {
        const fetchList = async () => {
            const result = await GetApprovalList();
            if (result) {
                setApproveContracts(result);
            } else {
                console.log('获取列表失败');
            }
        };
        fetchList();

        async function fetchApprovers() {
            const result = await getUsersByPermission('approve');
            if (result) {
                setApprovers(result);
            }
        }
        fetchApprovers();
    }, []);

    const showModal = (contract) => {
        setCurrentContract(contract);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            //console.log('指定审批人:', values.approver);
            const formdata = { id: currentContract.id, userId: values.approver };
            const result = await SetContractApprover(formdata);
            if (result) {
                message.success(result);
            }
            setIsModalVisible(false);
            form.resetFields();
            const r = await GetApprovalList();
            if (r) {
                setApproveContracts(r);
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
                dataSource={approveContracts}
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
                        name="approver"
                        label="审批人"
                        rules={[{ required: true, message: '请选择审批人' }]}
                    >
                        <Select
                            placeholder="选择审批人"
                        >
                            {approvers.map(user => (
                                <Option key={user.username} value={user.username}>
                                    {user.username}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
