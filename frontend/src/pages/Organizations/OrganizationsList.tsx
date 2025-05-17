import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress, IconButton, Tooltip, DialogContentText } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import API from '../../api/axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "../../theme/ThemeContext";

const columnsBase: (GridColDef & { hideOnMobile?: boolean })[] = [
  { field: 'id', headerName: 'ID', width: 90, hideOnMobile: true },
  { field: 'name', headerName: 'Nombre', flex: 1 },
  { field: 'description', headerName: 'Descripción', flex: 2 },
  { field: 'logo', headerName: 'Logo', width: 100, renderCell: (params) => params.value ? <img src={params.value} alt="logo" style={{ width: 40, height: 40 }} /> : '-', hideOnMobile: true },
];

export default function OrganizationsList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', description: '', logo: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, orgId: string, orgName: string }>({ open: false, orgId: '', orgName: '' });
  const [deleting, setDeleting] = useState(false);
  const { theme } = useTheme();

  const fetchOrgs = () => {
    setLoading(true);
    API.get('/organizations')
      .then(res => {
        setRows(res.data.map((o: any, idx: number) => ({
          id: o.id || o._id || idx + 1,
          _id: o.id || o._id || idx + 1,
          name: o.name,
          description: o.description || '',
          logo: o.logo || '',
        })));
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  // --- Alta y edición ---
  const handleOpen = () => {
    setForm({ id: '', name: '', description: '', logo: '' });
    setFormError('');
    setEditMode(false);
    setOpen(true);
  };
  const handleEdit = (row: any) => {
    setForm({
      id: row._id,
      name: row.name,
      description: row.description,
      logo: row.logo,
    });
    setFormError('');
    setEditMode(true);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      if (editMode) {
        await API.put(`/organizations/${form.id}`, {
          name: form.name,
          description: form.description,
          logo: form.logo,
        });
        setSnackbar({ open: true, message: 'Organización actualizada', severity: 'success' });
      } else {
        await API.post('/organizations', {
          name: form.name,
          description: form.description,
          logo: form.logo,
        });
        setSnackbar({ open: true, message: 'Organización creada exitosamente', severity: 'success' });
      }
      setOpen(false);
      fetchOrgs();
    } catch (e: any) {
      setFormError(e?.response?.data || 'Error al guardar organización');
    } finally {
      setSaving(false);
    }
  };

  // --- Eliminar ---
  const handleDelete = (row: any) => {
    setDeleteDialog({ open: true, orgId: row._id, orgName: row.name });
  };
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await API.delete(`/organizations/${deleteDialog.orgId}`);
      setSnackbar({ open: true, message: 'Organización eliminada', severity: 'success' });
      setDeleteDialog({ open: false, orgId: '', orgName: '' });
      fetchOrgs();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data || 'Error al eliminar organización', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };
  const handleDeleteCancel = () => setDeleteDialog({ open: false, orgId: '', orgName: '' });

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
      <Paper elevation={2} sx={{ p: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" px={3} py={2} borderBottom={1} borderColor="divider">
          <Box>
            <Typography variant="h6" fontWeight={600} color={theme === "dark" ? "text.primary" : "text.secondary"} gutterBottom>
              Organizaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestión de organizaciones del sistema
            </Typography>
          </Box>
          <Button variant="contained" color="primary" onClick={handleOpen} size="small">
            Nueva Organización
          </Button>
        </Box>
        <Box px={3} py={2}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[7, 15, 30]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
      {/* Alta/Edición Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? 'Editar Organización' : 'Nueva Organización'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Descripción"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="URL de logo"
              name="logo"
              value={form.logo}
              onChange={handleChange}
              fullWidth
            />
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
        <DialogTitle>Eliminar Organización</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar la organización <b>{deleteDialog.orgName}</b>? Esta acción no se puede deshacer.
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