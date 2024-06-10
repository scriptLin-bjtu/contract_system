import React from 'react';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import LoginPage from './pages/loginpages.js';
import RegisterPage from './pages/registerpage.js';
import HomePage from './pages/homepage.js';
export default function App() {
    return (
	<>
	<Router>
	<Routes>
	  <Route path="/login" element={<LoginPage></LoginPage>} />
	  <Route path="/register" element={<RegisterPage></RegisterPage>} />
	  <Route path="/home" element={<HomePage/>} />
	  <Route path='*' element={<Navigate to='/home'/>}></Route>
	</Routes>   
	</Router>
	</>
	);
}
