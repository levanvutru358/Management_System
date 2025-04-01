import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: '240px', mt: 2 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Typography>Welcome to the Task Management System!</Typography>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Dashboard;