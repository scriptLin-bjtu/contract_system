import axios from 'axios';
import { message } from 'antd';

const BASE_URL = '/api';

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 5000
});

service.interceptors.request.use(config => {
  return config;
}, error => {
  return Promise.reject(error);
});

service.interceptors.response.use(response => {
  if (response.data.code === 200) {
    return response.data.data;
  } else {
    message.error(response.data.message || '请求失败，请重试');
    return Promise.reject(response.data.message || '请求失败，请重试');
  }
}, error => {
  if (error.response && error.response.status) {
    const { status, data } = error.response;
    if (status === 401) {
      message.error('认证失败，请重新登录');
      localStorage.clear();
    } else if (status === 404) {
      message.error('请求的资源不存在');
    } else {
      message.error(data.message || '请求失败，请重试');
    }
    return Promise.reject(error);
  } else {
    message.error('请求失败，请重试');
    return Promise.reject('请求失败，请重试');
  }
});

export function get(url, params=null) {
  return service.get(url, { params });
}

export function post(url, data) {
  return service.post(url, data);
}
