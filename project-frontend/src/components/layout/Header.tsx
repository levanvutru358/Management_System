// frontend/src/components/layout/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../../services/authService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Task Management
        </Typography>
        {user && (
          <>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Welcome, {user.email} ({user.role})
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;