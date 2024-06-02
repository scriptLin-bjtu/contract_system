import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { GetContractDetails } from '../../services/api';

export default function SearchContract() {
    const [contractId, setContractId] = useState('');
    const [contractDetails, setContractDetails] = useState(null);

    const handleQuery = async () => {
        if (!contractId) {
            message.error('请输入合同ID');
            return;
        }

        try {
            const result = await GetContractDetails(contractId);
            if (result) {
                console.log(result);
                setContractDetails(result);
            } else {
                message.error('查询合同信息失败');
            }
        } catch (error) {
            console.error('查询合同信息失败：', error);
            message.error('查询合同信息失败');
        }
    };

    return (
        <div>
            <Input
                placeholder="输入合同ID"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                style={{ width: 200, marginRight: 10 }}
            />
            <Button onClick={handleQuery}>查询</Button>

            {contractDetails && (
                <div style={{ marginTop: 20 }}>
                    <h3>合同详情</h3>
                    <p>合同标题: {contractDetails.contract.title}</p>
                    <p>描述: {contractDetails.contract.description}</p>
                    <p>客户: {contractDetails.contract.client_name}</p>
                    <p>状态: {contractDetails.contract.status}</p>

                    <h4>附件</h4>
                    {contractDetails.contract.attachment && (
                        <a href={`http://localhost:3001${contractDetails.contract.attachment}`} download>
                            下载附件
                        </a>
                    )}

                    <h4>合同修改记录</h4>
                    {contractDetails.changes.map((change) => (
                        <div key={change.id}>
                            <p>描述: {change.change_description}</p>
                            <p>修改人: {change.changed_by}</p>
                            <p>修改时间: {new Date(change.changed_at).toLocaleString()}</p>
                        </div>
                    ))}

                    <h4>合同流程信息</h4>
                    <p>流程步骤: {contractDetails.process.step}</p>
                    <p>流程状态: {contractDetails.process.status}</p>
                    <p>完成时间: {contractDetails.process.completed_at ? new Date(contractDetails.process.completed_at).toLocaleString() : '未完成'}</p>

                    <h4>用户权限信息</h4>
                    {contractDetails.permissions.map((permission) => (
                        <div key={permission.id}>
                            <p>用户ID: {permission.user_id}</p>
                            <p>权限: {permission.permission}</p>
                        </div>
                    ))}

                    <h4>签署信息</h4>
                    {contractDetails.signatures.map((signature) => (
                        <div key={signature.id}>
                            <p>签署人: {signature.signed_by}</p>
                            <p>评论: {signature.comment}</p>
                            <p>签署时间: {new Date(signature.signed_at).toLocaleString()}</p>
                            <p>状态: {signature.status}</p>
                            <p>签署类型: {signature.signature_type}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
