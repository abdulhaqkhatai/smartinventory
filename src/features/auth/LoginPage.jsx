import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Inventory2,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { performLogin, clearError } from './authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(performLogin(email, password));
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@smartinv.com' },
    { role: 'Store Manager', email: 'store@smartinv.com' },
    { role: 'Purchase Manager', email: 'purchase@smartinv.com' },
    { role: 'Employee', email: 'employee@smartinv.com' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(ellipse at 20% 50%, #0D2137 0%, #0A1929 50%, #071322 100%)'
            : 'linear-gradient(135deg, #E0F7FA 0%, #F0F4F8 50%, #E8EAF6 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* Animated Background Orbs */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 191, 166, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        component={motion.div}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 77, 255, 0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Card
          sx={{
            width: { xs: '100%', sm: 440 },
            maxWidth: 440,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #00BFA6 0%, #7C4DFF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 8px 24px rgba(0, 191, 166, 0.3)',
                  }}
                >
                  <Inventory2 sx={{ fontSize: 32, color: '#fff' }} />
                </Box>
              </motion.div>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Smart Inventory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Store Management System
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="admin@smartinv.com"
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="admin123"
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #00BFA6 0%, #00897B 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00D4B8 0%, #00A693 100%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            {/* Demo Accounts */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mb={1}>
                Demo Accounts (password: admin123)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center' }}>
                {demoAccounts.map((account) => (
                  <Chip
                    key={account.email}
                    label={account.role}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword('admin123');
                    }}
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(0, 191, 166, 0.08)'
                            : 'rgba(0, 137, 123, 0.08)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
