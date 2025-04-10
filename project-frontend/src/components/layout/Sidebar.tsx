import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 150, boxSizing: 'border-box', zIndex: 1000 }, 
      }}
    >
      <List>
        <ListItem component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem component={Link} to="/tasks">
          <ListItemText primary="Tasks" />
        </ListItem>
        <ListItem component={Link} to="/reports">
          <ListItemText primary="Reports" />
        </ListItem>
        <ListItem component={Link} to="/profile">
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem component={Link} to="/admin">
          <ListItemText primary="Admin" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;