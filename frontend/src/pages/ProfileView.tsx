import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Avatar, Snackbar, Alert, CircularProgress, Paper, Divider } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function ProfileView() {
  const { user, token } = useAuth() as any;
  const [form, setForm] = useState({
    firstName: user?.first_name || user?.firstName || '',
    lastName: user?.last_name || user?.lastName || '',
    bio: user?.bio || '',
    profileImage: user?.profile_image || user?.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/profile', {
        first_name: form.firstName,
        last_name: form.lastName,
        bio: form.bio,
        profile_image: form.profileImage,
      });
      setSnackbar({ open: true, message: 'Perfil actualizado', severity: 'success' });
      // Opcional: recargar usuario en el contexto
      window.location.reload();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data || 'Error al actualizar perfil', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    // Implementa la lógica para cerrar sesión
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Avatar src={user.avatar} alt={user.name} sx={{ width: 96, height: 96, fontSize: 40 }}>
            {user.name?.[0] || user.first_name?.[0] || '?'}
          </Avatar>
          <Typography variant="h5" fontWeight={700} align="center">
            {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre'}
          </Typography>
          <Typography variant="body1" align="center">
            {user.email}
          </Typography>
          {user.bio && (
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              {user.bio}
            </Typography>
          )}
          {user.roles && Array.isArray(user.roles) && user.roles.length > 0 && (
            <Typography variant="caption" align="center" sx={{ mt: 1 }}>
              {user.roles.join(', ')}
            </Typography>
          )}
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/profile/edit')}>
            Editar perfil
          </Button>
          <Button variant="outlined" color="primary" onClick={logout}>
            Cerrar sesión
          </Button>
        </Box>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 