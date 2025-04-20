import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../../services/authService";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed" // fixed để header dính trên cùng
      sx={{
        height: "50px",
        justifyContent: "center",
        zIndex: (theme) => theme.zIndex.drawer + 1, // đảm bảo nằm trên sidebar
      }}
    >
      <Toolbar
        sx={{
          minHeight: "50px !important",
          px: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontSize: "1rem", whiteSpace: "nowrap" }}
        >
          Task Management
        </Typography>
        {user && (
          <>
            <Typography
              variant="body2"
              sx={{
                mr: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
              }}
            >
              Welcome, {user.email} ({user.role})
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              size="small"
              sx={{ textTransform: "none", fontSize: "0.8rem" }}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
