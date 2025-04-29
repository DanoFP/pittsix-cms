import React from 'react';
import { Box, Typography } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function Dashboard() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: { xs: 2, md: 6 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary.dark" sx={{ mb: 2 }}>
          Bienvenido al Panel de Control
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Accede rápidamente a la gestión de usuarios, organizaciones y artículos.
        </Typography>
        <Outlet />
      </Box>
    </Box>
  );
}