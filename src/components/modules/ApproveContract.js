import React, { useState, useEffect } from 'react';
import { message, Button, List, Modal, Form, Input, Select } from 'antd';
import { GetPendingApproval, SubmitApprovalResults } from '../../services/api.js';

const { Option } = Select;

export default function ApproveContract() {
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchContracts = async () => {
            const result = await GetPendingApproval();
            if (result) {
                setContracts(result);
            } else {
                message.error('获取待审批合同列表失败');
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
            const result = await SubmitApprovalResults({
                contractId: selectedContract.id,
                comment: values.comment,
                status: values.status,
            });
            if (result) {
                message.success(result);
                setIsModalVisible(false);
                form.resetFields();
                const r = await GetPendingApproval();
                if (r) {
                    setContracts(r);
                } else {
                    message.error('获取待审批合同列表失败');
                }
            } else {
                message.error('提交审批失败');
            }
        } catch (error) {
            console.error('提交审批失败：', error);
        }
    };

    return (
        <div>
            <h3>待审批合同列表</h3>
            <List
                dataSource={contracts}
                renderItem={(contract) => (
                    <List.Item actions={[<Button onClick={() => handleOpenModal(contract)}>填写审批意见</Button>]}>
                        <List.Item.Meta
                            title={contract.title}
                            description={contract.description}
                        />
                    </List.Item>
                )}
            />
            <Modal
                title="填写审批意见"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form}>
                    <Form.Item
                        name="comment"
                        label="审批意见"
                        rules={[{ required: true, message: '请输入审批意见' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select placeholder="请选择状态">
                            <Option value="approved">批准</Option>
                            <Option value="rejected">拒绝</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
