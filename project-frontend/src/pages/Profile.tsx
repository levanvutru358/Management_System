import React, { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import ProfileCard from '../components/user/ProfileCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser } from '../store/slices/userSlice';
import { getCurrentUser } from '../services/userService';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      dispatch(setUser(currentUser));
    };
    loadUser();
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar />
        <Container sx={{ ml: '240px', mt: 2 }}>
          <Typography variant="h4">Profile</Typography>
          {user && <ProfileCard user={user} />}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Profile;