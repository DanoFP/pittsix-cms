import React from 'react';
import { Container, Typography, Box, Avatar, Paper, Divider, Button, Chip, Stack } from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';

export default function ProfileView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{
              width: 112,
              height: 112,
              fontSize: 48,
              boxShadow: 3,
              border: (theme) => `3px solid ${theme.palette.primary.main}`,
              mb: 2,
            }}
          >
            {user.name?.[0] || user.first_name?.[0] || '?'}
          </Avatar>
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
            {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre'}
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
            {user.email}
          </Typography>
          {user.bio && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, maxWidth: 360 }}>
              {user.bio}
            </Typography>
          )}
          {user.roles && Array.isArray(user.roles) && user.roles.length > 0 && (
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 2 }}>
              {user.roles.map((role: string) => (
                <Chip key={role} label={role} color="primary" size="small" sx={{ textTransform: 'capitalize' }} />
              ))}
            </Stack>
          )}
        </Box>
        <Divider sx={{ my: 4 }} />
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate('/dashboard/profile/edit')}
            size="large"
          >
            Editar perfil
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={logout}
            size="large"
          >
            Cerrar sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 