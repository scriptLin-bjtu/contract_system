import React, { useState, useEffect } from 'react';
import { message, Button, List, Modal, Form, Input } from 'antd';
import { GetFinalDrafts, SubmitFinalDraft } from '../../services/api.js';
export default function FinalizeContract() {
  const [contracts, setContracts] = useState([]);
      const [selectedContract, setSelectedContract] = useState(null);
      const [isModalVisible, setIsModalVisible] = useState(false);
      const [form] = Form.useForm();
  
      useEffect(() => {
          const fetchContracts = async () => {
              const result = await GetFinalDrafts();
              if (result) {
                  setContracts(result);
              } else {
                  message.error('获取待定稿合同列表失败');
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
              const result = await SubmitFinalDraft({
                  contractId: selectedContract.id,
                  title: values.title,
                  description: values.description,
                  clientName: values.clientName,
                  changeDescription: values.changeDescription,
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
                                      <ul>
                                          {contract.signatures.map(signature => (
                                              <li key={signature.username}>
                                                  {signature.username}: {signature.comment} ({signature.status})
                                              </li>
                                          ))}
                                      </ul>
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
                          label="标题"
                          rules={[{ required: true, message: '请输入标题' }]}
                      >
                          <Input />
                      </Form.Item>
                      <Form.Item
                          name="description"
                          label="描述"
                          rules={[{ required: true, message: '请输入描述' }]}
                      >
                          <Input.TextArea rows={4} />
                      </Form.Item>
                      <Form.Item
                          name="clientName"
                          label="客户名"
                          rules={[{ required: true, message: '请输入客户名' }]}
                      >
                          <Input />
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
          </div>
      );
}