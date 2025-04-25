// frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Assignment, Assessment, Dashboard, Person } from '@mui/icons-material';
import { getCurrentUser } from '../../services/authService';

// Định nghĩa type cho Link để TypeScript hiểu
interface LinkProps {
  to: string;
  children: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const user = getCurrentUser();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 200,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 200,
          boxSizing: 'border-box',
          mt: '64px', // Để Sidebar nằm dưới Header
          zIndex: 1000,
        },
      }}
    >
      <List>
        <ListItem component={RouterLink} to="/dashboard">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem component={RouterLink} to="/tasks">
          <ListItemIcon>
            <Assignment />
          </ListItemIcon>
          <ListItemText primary="Tasks" />
        </ListItem>
        {user?.role === 'admin' && (
          <ListItem component={RouterLink} to="/reports">
            <ListItemIcon>
              <Assessment />
            </ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>
        )}
        <ListItem component={RouterLink} to="/profile">
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;