import LoginPage from '../pages/loginpages';
import RegisterPage from '../pages/registerpage';
import HomePage from '../pages/homepage';
import {Navigate} from 'react-router-dom';
export default [
	{
		path:'/home',
		element:<HomePage/>
	},
	{
		path:'login',
		element:<LoginPage/>
	},
	{
		path:'register',
		element:<RegisterPage/>
	},
	{
		path:'*',
		element:<Navigate to='/home'/>
	}
]