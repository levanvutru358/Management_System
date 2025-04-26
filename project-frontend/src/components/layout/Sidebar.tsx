// frontend/src/components/layout/Sidebar.tsx
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Assignment, Assessment, Dashboard, Person } from "@mui/icons-material";
import { getCurrentUser } from "../../services/authService";

// ✅ LinkProps dùng cho SidebarLink
interface LinkProps {
  to: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const SidebarLink: React.FC<LinkProps> = ({ to, children, icon }) => (
  <ListItem component={RouterLink} to={to}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={children} />
  </ListItem>
);

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
          boxSizing: "border-box",
          mt: "64px", // dưới Header
          zIndex: 1000,
        },
      }}
    >
      <List>
        <SidebarLink to="/dashboard" icon={<Dashboard />}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/tasks" icon={<Assignment />}>
          Tasks
        </SidebarLink>
        {user?.role === "admin" && (
          <SidebarLink to="/reports" icon={<Assessment />}>
            Reports
          </SidebarLink>
        )}
        <SidebarLink to="/profile" icon={<Person />}>
          Profile
        </SidebarLink>
      </List>
    </Drawer>
  );
};

export default Sidebar;
