import React, { useEffect, useState } from 'react';
import { message, Button, List, Form, Modal, Select } from 'antd';
import { GetDraft, SetCountersigner, getUsersByPermission } from '../../services/api.js';

const { Option } = Select;

export default function ManageDraftContract() {
    const [drafts, setDrafts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentContract, setCurrentContract] = useState(null);
    const [form] = Form.useForm();
    const [countersigners, setCountersigners] = useState([]);

    useEffect(() => {
        const fetchList = async () => {
            const result = await GetDraft();
            if (result) {
                setDrafts(result);
            } else {
                console.log('获取列表失败');
            }
        };
        fetchList();

        async function fetchCountersigners() {
            const result = await getUsersByPermission('countersign');
            if (result) {
                setCountersigners(result);
            }
        }
        fetchCountersigners();
    }, []);

    const showModal = (contract) => {
        setCurrentContract(contract);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            //console.log('指定会签人:', values.signers.join(';'));
            const formdata = { id: currentContract.id, users: values.signers.join(';') };
            const result = await SetCountersigner(formdata);
            if (result) {
                message.success(result);
            }
            setIsModalVisible(false);
            form.resetFields();
            const r = await GetDraft();
            if (r) {
                setDrafts(r);
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
            <h3>指定会签人</h3>
            <List
                itemLayout="horizontal"
                dataSource={drafts}
                renderItem={contract => (
                    <List.Item
                        actions={[<Button type="primary" onClick={() => showModal(contract)}>指定会签人</Button>]}
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
                title="指定会签人"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="signers"
                        label="会签人"
                        rules={[{ required: true, message: '请输入会签人' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="选择会签人"
                        >
                            {countersigners.map(user => (
                                <Option key={user.id} value={user.username}>
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
