import React from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/ReduxHooks';
import { logout } from '../features/auth/authSlice';
import { persistor } from '../app/store'; // 🔥 import your persistor

const SignOut: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout()); 
    persistor.purge();  
    navigate('/login'); 
  };

  return (
    <Button 
      type="text" 
      className="p-2" 
      onClick={handleLogout} 
      icon={<LogoutOutlined />} 
      danger
    >
      Logout
      
    </Button>
  );
};

export default SignOut;
