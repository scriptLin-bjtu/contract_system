import { createSlice } from '@reduxjs/toolkit';


const permissionSlice = createSlice({
  name: 'permissions',  
  initialState: { 
	  permission:{
	  can_draft_contract:0,
	  can_approve_contract:0,
	  can_finalize_contract:0,
	  can_countersign_contract:0,
	  can_query_contract:0,
	  can_sign_contract:0
	},
  },  // 初始状态
  reducers: {
    authorize:(state,action)=>{
		state.permission=action.payload;
	}
  },
});

// 导出 actions
export const { authorize } = permissionSlice.actions;

// 导出 reducer
export default permissionSlice.reducer;
