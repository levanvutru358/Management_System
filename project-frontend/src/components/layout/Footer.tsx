// frontend/src/components/layout/Footer.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
      <Typography variant="body2" color="textSecondary">
        © 2025 Task Management App. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;