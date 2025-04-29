import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert, CircularProgress, IconButton, Tooltip, DialogContentText } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetter } from '@mui/x-data-grid';
import API from '../../api/axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const columnsBase: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'firstName', headerName: 'Nombre', flex: 1 },
  { field: 'lastName', headerName: 'Apellido', flex: 1 },
  { field: 'roles', headerName: 'Roles', flex: 1, valueGetter: (params: any) => (params.row?.roles || []).join(', ') },
];

const roleOptions = [
  { value: 'user', label: 'Usuario' },
  { value: 'org_admin', label: 'Administrador Org.' },
  { value: 'superadmin', label: 'Superadmin' },
];

export default function UsersList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ id: '', email: '', firstName: '', lastName: '', roles: ['user'] });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, userId: string, userEmail: string }>({ open: false, userId: '', userEmail: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    API.get('/users')
      .then(res => {
        setRows(res.data.map((u: any, idx: number) => ({
          id: u.id || u._id || idx + 1,
          _id: u.id || u._id || idx + 1,
          email: u.email,
          firstName: u.first_name || u.firstName,
          lastName: u.last_name || u.lastName,
          roles: u.roles,
        })));
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Alta y edición ---
  const handleOpen = () => {
    setForm({ id: '', email: '', firstName: '', lastName: '', roles: ['user'] });
    setFormError('');
    setEditMode(false);
    setOpen(true);
  };
  const handleEdit = (row: any) => {
    setForm({
      id: row._id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      roles: row.roles,
    });
    setFormError('');
    setEditMode(true);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleRolesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, roles: typeof e.target.value === 'string' ? [e.target.value] : e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.email || !form.firstName || !form.lastName || !form.roles.length) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      if (editMode) {
        await API.put(`/users/${form.id}`, {
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          roles: form.roles,
        });
        setSnackbar({ open: true, message: 'Usuario actualizado', severity: 'success' });
      } else {
        await API.post('/users', {
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          roles: form.roles,
        });
        setSnackbar({ open: true, message: 'Usuario creado exitosamente', severity: 'success' });
      }
      setOpen(false);
      fetchUsers();
    } catch (e: any) {
      setFormError(e?.response?.data || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  // --- Eliminar ---
  const handleDelete = (row: any) => {
    setDeleteDialog({ open: true, userId: row._id, userEmail: row.email });
  };
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await API.delete(`/users/${deleteDialog.userId}`);
      setSnackbar({ open: true, message: 'Usuario eliminado', severity: 'success' });
      setDeleteDialog({ open: false, userId: '', userEmail: '' });
      fetchUsers();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data || 'Error al eliminar usuario', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };
  const handleDeleteCancel = () => setDeleteDialog({ open: false, userId: '', userEmail: '' });

  // --- Columnas con acciones ---
  const columns: GridColDef[] = [
    ...columnsBase,
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Editar">
            <IconButton color="primary" onClick={() => handleEdit(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton color="error" onClick={() => handleDelete(params.row)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>Usuarios</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>Nuevo Usuario</Button>
      </Box>
      <Paper elevation={2} sx={{ height: 480 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[7, 15, 30]}
          disableRowSelectionOnClick
          sx={{ border: 0, fontSize: 16, background: 'white' }}
        />
      </Paper>
      {/* Alta/Edición Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              disabled={editMode}
            />
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
              select
              label="Rol"
              name="roles"
              value={form.roles[0]}
              onChange={handleRolesChange}
              required
              fullWidth
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            {formError && <Alert severity="error">{formError}</Alert>}
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={saving && <CircularProgress size={18} />}>
                {editMode ? 'Guardar cambios' : 'Guardar'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Eliminar Modal */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar el usuario <b>{deleteDialog.userEmail}</b>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting} startIcon={deleting && <CircularProgress size={18} />}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 