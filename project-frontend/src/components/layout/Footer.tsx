import React from 'react';
import { Typography, Box } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box sx={{ p: 2, textAlign: 'center', mt: 'auto' }}>
      <Typography variant="body2">© 2025 Task Management System</Typography>
    </Box>
  );
};

export default Footer;