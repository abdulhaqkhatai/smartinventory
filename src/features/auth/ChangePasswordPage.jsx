import React, { useState } from 'react';
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
  LinearProgress,
} from '@mui/material';

import {
  Visibility,
  VisibilityOff,
  Lock,
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';

import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState('');

  // Password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) {
      return {
        score: 0,
        label: '',
        color: '#546E7A',
      };
    }

    let score = 0;

    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;

    if (score <= 25) {
      return {
        score,
        label: 'Weak',
        color: '#FF5252',
      };
    }

    if (score <= 50) {
      return {
        score,
        label: 'Fair',
        color: '#FFB74D',
      };
    }

    if (score <= 75) {
      return {
        score,
        label: 'Good',
        color: '#29B6F6',
      };
    }

    return {
      score,
      label: 'Strong',
      color: '#66BB6A',
    };
  };

  const strength = getPasswordStrength(newPassword);

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (currentPassword !== 'admin123') {
      setError('Current password is incorrect');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    enqueueSnackbar('Password changed successfully!', {
      variant: 'success',
    });

    navigate('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          maxWidth: 500,
          mx: 'auto',
          mt: 2,
        }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Heading */}
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
            >
              Change Password
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Ensure your account is using a strong password for security.
            </Typography>

            {/* Error */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              {/* Current Password */}
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                required
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock
                        sx={{
                          color: 'text.secondary',
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),

                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          togglePasswordVisibility('current')
                        }
                        edge="end"
                        size="small"
                      >
                        {showPasswords.current ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* New Password */}
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
                sx={{ mb: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock
                        sx={{
                          color: 'text.secondary',
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),

                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          togglePasswordVisibility('new')
                        }
                        edge="end"
                        size="small"
                      >
                        {showPasswords.new ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Strength */}
              {newPassword && (
                <Box sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Password Strength
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: strength.color,
                        fontWeight: 600,
                      }}
                    >
                      {strength.label}
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        'rgba(148, 163, 184, 0.1)',

                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: strength.color,
                      },
                    }}
                  />
                </Box>
              )}

              {/* Confirm Password */}
              <TextField
                fullWidth
                label="Confirm New Password"
                type={
                  showPasswords.confirm
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                sx={{ mb: 3 }}
                error={
                  confirmPassword !== '' &&
                  confirmPassword !== newPassword
                }
                helperText={
                  confirmPassword !== '' &&
                  confirmPassword !== newPassword
                    ? 'Passwords do not match'
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock
                        sx={{
                          color: 'text.secondary',
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),

                  endAdornment:
                    confirmPassword &&
                    confirmPassword === newPassword ? (
                      <InputAdornment position="end">
                        <CheckCircle
                          sx={{
                            color: 'success.main',
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ) : (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            togglePasswordVisibility(
                              'confirm'
                            )
                          }
                          edge="end"
                          size="small"
                        >
                          {showPasswords.confirm ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                }}
              />

              {/* Update Password Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  py: 1.5,

                  background:
                    'linear-gradient(135deg, #00BFA6 0%, #00897B 100%)',

                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #00D4B8 0%, #00A693 100%)',
                  },
                }}
              >
                Update Password
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
};

export default ChangePasswordPage;