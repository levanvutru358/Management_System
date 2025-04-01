import React from 'react';
import { Card, CardContent, Typography, Avatar } from '@mui/material';
import { User } from '../../types/user';

interface ProfileCardProps {
  user: User;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <Card>
      <CardContent>
        <Avatar src={user.avatar} sx={{ width: 56, height: 56, mb: 2 }} />
        <Typography variant="h6">{user.name}</Typography>
        <Typography>Email: {user.email}</Typography>
        <Typography>Role: {user.role}</Typography>
        <Typography>Active: {user.isActive ? 'Yes' : 'No'}</Typography>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;