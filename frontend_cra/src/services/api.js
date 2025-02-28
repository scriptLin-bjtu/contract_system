import { post,get } from '../utils/request';
//登陆
export async function Login(formdata) {
  try {
    const response = await post('/login', formdata, true);
    console.log('Response:', response);
    const { token } = response;
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    console.error('Error:', error);
  }
}
//注册
export async function Register(formdata) {
	try {
	  const response = await post('/register', formdata, true);
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}
//登出
export function Logout(){
	localStorage.removeItem('token');
	return true;
}

//检查用户状态
export async function CheckUser(){
	try {
	  const response = await get('/checkAuth');
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//获取用户权限列表
export async function getUsersByPermission(permission){
	try {
	  const response = await get(`/getUsers/${permission}`);
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//起草合同
export async function Draft(formdata){
	try {
	  const response = await post('/draftContract',formdata);
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//获取起草列表
export async function GetDraft(){
	try {
	  const response = await get('/getDraftList');
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//指定会签人
export async function SetCountersigner(formdata){
	try {
	  const response = await post('/setCountersigner',formdata);
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//获取待会签合同列表
export async function GetPendingContracts(){
	try {
	  const response = await get('/getPendingContracts');
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//提交会签
export const SubmitCountersign = async (data) => {
    try {
        const response = await post('/submitCountersign', data);
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
};

//获取待定稿列表
export async function GetFinalDrafts(){
	try {
	  const response = await get('/getFinalDrafts');
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//提交定稿
export async function SubmitFinalDraft(data){
	try {
	  const response = await post('/submitFinalDraft',data);
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//获取定稿合同列表
export async function GetApprovalList(){
	try {
	  const response = await get('/getApprovalList');
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//指定审批人
export async function SetContractApprover(data){
	try {
	  const response = await post('/setContractApprover',data);
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//获取待审批列表
export async function GetPendingApproval(){
	try {
	  const response = await get('/getPendingApproval');
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//提交审批
export const SubmitApprovalResults = async (data) => {
    try {
        const response = await post('/submitApprovalResults', data);
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
};

//获取待签订列表
export async function GetPendingSignContracts(){
	try {
	  const response = await get('/getPendingSignContracts');
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//提交签订信息
export const  SubmitSignContract = async (data) => {
    try {
        const response = await post('/submitSignContract', data);
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
};

//获取合同信息
export async function GetContractDetails(contractId){
	try {
	  const response = await post('/getContractDetails',{contractId});
	  return response;
	} catch (error) {
	  console.error('Error:', error);
	}
}

//更新用户权限
export async function updateUserPermissions(data){
	try {
	    const response = await post('/updateUserPermissions', data);
	    return response;
	} catch (error) {
	    console.error('Error:', error);
	}
}

//检测用户权限
export async function checkPermission(permission){
	try {
	    const response = await post(`/checkPermission/${permission}`);
	    return response;
	} catch (error) {
	    console.error('Error:', error);
	}
}