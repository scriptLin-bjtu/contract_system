import {CheckUser} from '../services/api.js'
import { useEffect,useState } from 'react';
import Unlogpage from '../components/Unlog.js'
import Userpage from '../components/User.js'
import Adminpage from '../components/Admin.js'
export default function HomePage(){
	const [user, setUser] = useState(null);
	useEffect(()=>{
		const fetchUserState = async () => {
		    const result=await CheckUser();
			if(result){
				console.log(result);
				setUser(result);
			}else{
				console.log('用户未登录!');
			}
		};
		fetchUserState();
	},[]);
	if (user === null) {
	    return <Unlogpage />;
	  }

	return (
	<>
	 {user.role === 'admin' ? <Adminpage /> : <Userpage />}
	</>
	);
}