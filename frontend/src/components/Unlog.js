import { Button } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Unlog() {
  const navigate = useNavigate();
  return (
    <>
      <h3>当前未登录</h3>
      <Button type="link" onClick={() => { navigate('/login') }}>前往登陆</Button>
    </>
  );
}
