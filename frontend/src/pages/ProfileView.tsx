import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Avatar, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import API from '../api/axios';

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

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Avatar src={form.profileImage} sx={{ width: 80, height: 80, mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>Mi Perfil</Typography>
        <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Nombre"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Apellido"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          multiline
          minRows={2}
          fullWidth
        />
        <TextField
          label="URL de foto de perfil"
          name="profileImage"
          value={form.profileImage}
          onChange={handleChange}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary" size="large" disabled={saving} startIcon={saving && <CircularProgress size={18} />}>
          Guardar cambios
        </Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 