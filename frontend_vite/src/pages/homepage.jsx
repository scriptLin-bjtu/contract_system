import {CheckUser,checkPermission} from '../services/api.js'
import { useEffect,useState ,lazy,Suspense} from 'react';
import {useDispatch} from 'react-redux';
import {authorize} from '../redux/slice/permissionSlice'
const Unlogpage =lazy(()=>import('../components/Unlog.jsx'));
const Userpage =lazy(()=>import('../components/User.jsx'));
const Adminpage =lazy(()=>import('../components/Admin.jsx'));
export default function HomePage(){
	const [user, setUser] = useState(null);
	const dispatch=useDispatch();
	useEffect(()=>{
		const fetchAllPermissions= async()=>{
			Promise.all([checkPermission('can_draft_contract'),checkPermission('can_approve_contract'),checkPermission('can_finalize_contract'),checkPermission('can_countersign_contract'),checkPermission('can_query_contract'),checkPermission('can_sign_contract')])
			.then(results=>{
				const newPermission={
					can_draft_contract:results[0],
					can_approve_contract:results[1],
					can_finalize_contract:results[2],
					can_countersign_contract:results[3],
					can_query_contract:results[4],
					can_sign_contract:results[5]
				}
				dispatch(authorize(newPermission));
			})
			.catch(err=>{
				console.error(err);
			})
		}
		const fetchUserState = async () => {
		    const result=await CheckUser();
			if(result){
				console.log(result);
				setUser(result);
			}else{
				console.log('用户未登录!');
			}
		};
		fetchUserState().then(()=>{fetchAllPermissions()});
	},[]);
	if (user === null) {
	    return <Suspense><Unlogpage /></Suspense>;
	  }

	return (
	<>
	<Suspense>
	 {user.role === 'admin' ? <Adminpage /> : <Userpage />}
	</Suspense>
	</>
	);
}