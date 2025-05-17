import React from 'react';
import { Paper, Box, Typography, Button, useTheme as useMuiTheme, useMediaQuery } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme } from '../theme/ThemeContext';

interface GenericDataTableProps {
  title: string;
  subtitle?: string;
  rows: any[];
  columns: (GridColDef & { hideOnMobile?: boolean })[];
  loading?: boolean;
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonProps?: any;
  children?: React.ReactNode; // para modales/snackbar
}

export default function GenericDataTable({
  title,
  subtitle,
  rows,
  columns,
  loading = false,
  buttonLabel,
  onButtonClick,
  buttonProps,
  children,
}: GenericDataTableProps) {
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const filteredColumns = React.useMemo(
    () =>
      isMobile
        ? columns.filter((col) => !col.hideOnMobile)
        : columns,
    [columns, isMobile]
  );
  return (
    <Paper elevation={2} sx={{ p: 0 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" px={3} py={2} borderBottom={1} borderColor="divider">
        <Box>
          <Typography variant="h6" fontWeight={600} color={theme === 'dark' ? 'text.primary' : 'text.secondary'} gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {buttonLabel && (
          <Button variant="contained" color="primary" onClick={onButtonClick} size="small" {...buttonProps}>
            {buttonLabel}
          </Button>
        )}
      </Box>
      <Box sx={{
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'auto',
        px: { xs: 0, md: 3 },
        py: 2
      }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={filteredColumns}
          loading={loading}
          pageSizeOptions={[7, 15, 30]}
          disableRowSelectionOnClick
          sx={{
            minWidth: 320,
            backgroundColor: muiTheme.palette.background.paper,
            fontSize: { xs: 13, md: 15 },
            '& .MuiDataGrid-cell': {
              py: { xs: 0.5, md: 1 },
              px: { xs: 0.5, md: 2 },
            },
            '& .MuiDataGrid-columnHeaders': {
              fontSize: { xs: 12, md: 15 },
            },
          }}
        />
      </Box>
      {children}
    </Paper>
  );
} 