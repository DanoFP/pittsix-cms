import React, { useEffect, useRef, useState } from 'react';
import { Container, Typography, Box, Avatar, Paper, Divider, Button, TextField, CircularProgress, Alert, Stack } from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const CORPORATE_BLUE = '#183153';
const CORPORATE_GRAY = '#f5f6fa';

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || user.firstName || user.name || '');
      setLastName(user.last_name || user.lastName || '');
      setBio(user.bio || '');
      setProfileImage(user.avatar || user.profile_image || '');
      setLoading(false);
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await API.post('/upload/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfileImage(res.data.url);
    } catch {
      setError('No se pudo subir la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await API.put('/profile', {
        first_name: firstName,
        last_name: lastName,
        bio,
        profile_image: profileImage,
      });
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => navigate('/dashboard/profile'), 1200);
    } catch (e: any) {
      setError(e?.response?.data || 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={1}>
        <Box px={4} py={3} borderBottom={1} borderColor="divider">
          <Typography variant="h6" fontWeight={700} align="left" gutterBottom>
            Editar perfil
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Stack direction="row" spacing={3} alignItems="center" px={4} py={2}>
            <Box position="relative">
              <Avatar src={profileImage} alt={firstName} sx={{ width: 56, height: 56, fontSize: 24 }}>
                {firstName?.[0] || '?'}
              </Avatar>
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 0, p: 0.5, position: 'absolute', bottom: -8, right: -8 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <EditIcon fontSize="small" />
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </Box>
            <Box flex={1}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Nombre"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  fullWidth
                  required
                  size="small"
                  variant="outlined"
                />
                <TextField
                  label="Apellido"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  fullWidth
                  required
                  size="small"
                  variant="outlined"
                />
              </Stack>
              <TextField
                label="Bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                sx={{ mt: 2 }}
                size="small"
                variant="outlined"
              />
            </Box>
          </Stack>
          {error && <Alert severity="error" sx={{ mx: 4, my: 1 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mx: 4, my: 1 }}>{success}</Alert>}
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="flex-end" gap={2} px={4} pb={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CloseIcon />}
              onClick={() => navigate('/dashboard/profile')}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 