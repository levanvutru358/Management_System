// frontend/src/pages/Login.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Container, Typography, Box, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { user } = await login(data);
      if (user.role === 'admin') {
        navigate('/reports');
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Email"
            variant="outlined"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary" size="large">
            Login
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;