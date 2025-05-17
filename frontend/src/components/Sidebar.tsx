import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Box, Typography, Avatar, Button, IconButton, useMediaQuery } from '@mui/material';
import { People, Business, Article, Dashboard as DashboardIcon, Logout, AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import React from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Usuarios", icon: <People />, path: "/dashboard/users" },
  { label: "Organizaciones", icon: <Business />, path: "/dashboard/organizations" },
  { label: "Artículos", icon: <Article />, path: "/dashboard/articles" },
  { label: "Perfil", icon: <AccountCircle />, path: "/dashboard/profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth() as any;
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [open, setOpen] = React.useState(false);

  const drawerContent = (
    <Box height="100%" display="flex" flexDirection="column" justifyContent="space-between">
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 72, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Avatar sx={{ bgcolor: 'primary.light', mr: 1, color: 'primary.contrastText' }}>P</Avatar>
          <Typography variant="h6" fontWeight={700} color="inherit">PittSix CMS</Typography>
        </Box>
        <List>
          {navItems.map(({ label, icon, path }) => (
            <ListItem disablePadding key={label}>
              <ListItemButton onClick={() => { navigate(path); if (isMobile) setOpen(false); }} sx={{ color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
                <ListItemIcon sx={{ color: 'primary.contrastText' }}>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', mr: 1, color: 'primary.contrastText' }}>
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={600} color="inherit">{user?.name || 'Cargando...'}</Typography>
            <Typography variant="body2" color="inherit">{user?.email || ''}</Typography>
          </Box>
        </Box>
        <Button variant="outlined" color="inherit" size="small" fullWidth startIcon={<Logout />} onClick={logout} sx={{ mt: 1, borderColor: 'primary.contrastText', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark', borderColor: 'primary.contrastText' } }}>
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', top: 16, left: 16, zIndex: 2100, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: 220,
              boxSizing: 'border-box',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer variant="permanent" anchor="left" sx={{
      width: 220,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: {
        width: 220,
        boxSizing: 'border-box',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
    }}>
      {drawerContent}
    </Drawer>
  );
} 