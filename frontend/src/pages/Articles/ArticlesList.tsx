import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress, IconButton, Tooltip, DialogContentText, MenuItem } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetter } from '@mui/x-data-grid';
import API from '../../api/axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
];

const columnsBase: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'author', headerName: 'Autor', flex: 1 },
  { field: 'status', headerName: 'Estado', width: 120 },
  { field: 'created_at', headerName: 'Fecha', width: 140, valueGetter: (params: any) => params.value ? new Date(params.value * 1000).toLocaleDateString() : '-' },
];

export default function ArticlesList() {
  const { user } = useAuth() as any;
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ id: '', title: '', content: '', image: '', status: 'draft', author: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, articleId: string, articleTitle: string }>({ open: false, articleId: '', articleTitle: '' });
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchArticles = () => {
    setLoading(true);
    API.get('/articles')
      .then(res => {
        setRows(res.data.map((a: any, idx: number) => ({
          id: a.id || a._id || idx + 1,
          _id: a.id || a._id || idx + 1,
          title: a.title,
          content: a.content,
          image: a.image || '',
          status: a.status || 'draft',
          author: a.author_name || a.author || '-',
          created_at: a.created_at || a.createdAt || null,
          slug: a.slug,
        })));
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // --- Alta y edición ---
  const handleOpen = () => {
    setForm({ id: '', title: '', content: '', image: '', status: 'draft', author: user?.name || '' });
    setFormError('');
    setEditMode(false);
    setOpen(true);
  };
  const handleEdit = (row: any) => {
    setForm({
      id: row._id,
      title: row.title,
      content: row.content,
      image: row.image,
      status: row.status,
      author: row.author,
    });
    setFormError('');
    setEditMode(true);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, status: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.content) {
      setFormError('Título y contenido son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      if (editMode) {
        await API.put(`/articles/${form.id}`, {
          title: form.title,
          content: form.content,
          image: form.image,
          status: form.status,
        });
        setSnackbar({ open: true, message: 'Artículo actualizado', severity: 'success' });
      } else {
        await API.post('/articles', {
          title: form.title,
          content: form.content,
          image: form.image,
          status: form.status,
        });
        setSnackbar({ open: true, message: 'Artículo creado exitosamente', severity: 'success' });
      }
      setOpen(false);
      fetchArticles();
    } catch (e: any) {
      setFormError(e?.response?.data || 'Error al guardar artículo');
    } finally {
      setSaving(false);
    }
  };

  // --- Eliminar ---
  const handleDelete = (row: any) => {
    setDeleteDialog({ open: true, articleId: row._id, articleTitle: row.title });
  };
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await API.delete(`/articles/${deleteDialog.articleId}`);
      setSnackbar({ open: true, message: 'Artículo eliminado', severity: 'success' });
      setDeleteDialog({ open: false, articleId: '', articleTitle: '' });
      fetchArticles();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data || 'Error al eliminar artículo', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };
  const handleDeleteCancel = () => setDeleteDialog({ open: false, articleId: '', articleTitle: '' });

  // --- Columnas con acciones ---
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Título',
      flex: 1,
      renderCell: (params) => (
        params.row._id ? (
          <Link to={`/article/${params.row._id}`} style={{ fontWeight: 600, color: '#1976d2', textDecoration: 'none' }} target="_blank" rel="noopener">
            {params.value}
          </Link>
        ) : (
          <span>{params.value}</span>
        )
      ),
    },
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

  // Función para subir imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, image: res.data.url });
      setSnackbar({ open: true, message: 'Imagen subida correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al subir imagen', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>Artículos</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>Nuevo Artículo</Button>
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
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Editar Artículo' : 'Nuevo Artículo'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Contenido"
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              fullWidth
              multiline
              minRows={4}
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
                sx={{ mb: 1 }}
              >
                {uploading ? 'Subiendo...' : 'Subir imagen'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
              {form.image && (
                <Box mt={1}>
                  <img src={form.image} alt="Vista previa" style={{ maxWidth: 180, borderRadius: 8 }} />
                </Box>
              )}
            </Box>
            <TextField
              select
              label="Estado"
              name="status"
              value={form.status}
              onChange={handleStatusChange}
              required
              fullWidth
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Autor"
              name="author"
              value={form.author}
              disabled
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
        <DialogTitle>Eliminar Artículo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar el artículo <b>{deleteDialog.articleTitle}</b>? Esta acción no se puede deshacer.
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