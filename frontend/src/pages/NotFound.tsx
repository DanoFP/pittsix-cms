import React from 'react';
import { Container, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Container>
      <Typography variant="h3" color="error" align="center" sx={{ mt: 8 }}>
        404 - Página no encontrada
      </Typography>
    </Container>
  );
} 