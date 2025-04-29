import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Box, Typography, Avatar, Button } from '@mui/material';
import { People, Business, Article, Dashboard as DashboardIcon, Logout, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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
  // user: { name, email, avatar }
  return (
    <Drawer variant="permanent" anchor="left" sx={{
      width: 220,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 72, borderBottom: 1, borderColor: 'divider' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>P</Avatar>
          <Typography variant="h6" fontWeight={700} color="primary">PittSix CMS</Typography>
        </Box>
        <List>
          {navItems.map(({ label, icon, path }) => (
            <ListItem disablePadding key={label}>
              <ListItemButton onClick={() => navigate(path)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', mr: 1 }}>
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={600}>{user?.name || 'Cargando...'}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
          </Box>
        </Box>
        <Button variant="outlined" color="primary" size="small" fullWidth startIcon={<Logout />} onClick={logout} sx={{ mt: 1 }}>
          Cerrar sesión
        </Button>
      </Box>
    </Drawer>
  );
} 