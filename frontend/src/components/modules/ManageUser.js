import React, { useState, useEffect } from 'react';
import { Button, Modal, Checkbox, message } from 'antd';
import { getUsersByPermission, updateUserPermissions } from '../../services/api.js';

export default function ManageUser() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [permissions, setPermissions] = useState({
        draftContract: false,
        countersignContract: false,
        finalizeContract: false,
        approveContract: false,
        signContract: false,
        viewContract: false
    });

    useEffect(() => {
        const fetchUsers = async () => {
            const result = await getUsersByPermission('all');
            if (result) {
                setUsers(result);
            } else {
                message.error('获取用户列表失败');
            }
        };

        fetchUsers();
    }, []);

    const handleManagePermissions = (user) => {
        setSelectedUser(user);
        setIsModalVisible(true);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setPermissions({ ...permissions, [name]: checked });
    };

    const handleOk = async () => {
        try {
            const result = await updateUserPermissions({userId:selectedUser.id, permissions:permissions});
            if (result) {
                message.success('用户权限更新成功');
                setIsModalVisible(false);
                // 重新获取用户列表，刷新界面
                const updatedUsers = await getUsersByPermission('all');
                setUsers(updatedUsers);
            } else {
                message.error('用户权限更新失败');
            }
        } catch (error) {
            console.error('用户权限更新失败：', error);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        // 重置权限
        setPermissions({
            draftContract: false,
            countersignContract: false,
            finalizeContract: false,
            approveContract: false,
            signContract: false,
            viewContract: false
        });
    };

    return (
        <div>
            <h3>用户列表</h3>
            {users.map(user => (
                <div key={user.id}>
                    <span>{user.username}</span>
                    <Button onClick={() => handleManagePermissions(user)}>管理权限</Button>
                </div>
            ))}
            <Modal
                title="管理权限"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Checkbox
                    name="draftContract"
                    checked={permissions.draftContract}
                    onChange={handleCheckboxChange}
                >
                    起草合同
                </Checkbox>
				<Checkbox
				    name="countersignContract"
				    checked={permissions.countersignContract}
				    onChange={handleCheckboxChange}
				>
				    会签合同
				</Checkbox>
				<Checkbox
				    name="finalizeContract"
				    checked={permissions.finalizeContract}
				    onChange={handleCheckboxChange}
				>
				    定稿合同
				</Checkbox>
				<Checkbox
				    name="approveContract"
				    checked={permissions.approveContract}
				    onChange={handleCheckboxChange}
				>
				    审批合同
				</Checkbox>
				<Checkbox
				    name="signContract"
				    checked={permissions.signContract}
				    onChange={handleCheckboxChange}
				>
				    签署合同
				</Checkbox>
				<Checkbox
				    name="viewContract"
				    checked={permissions.viewContract}
				    onChange={handleCheckboxChange}
				>
				    查询合同
				</Checkbox>
            </Modal>
        </div>
    );
}
