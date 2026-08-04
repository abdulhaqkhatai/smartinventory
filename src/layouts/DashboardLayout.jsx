import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Badge,
  InputBase,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Notifications,
  Search,
  Logout,
  Person,
  DarkMode,
  LightMode,
  Settings,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Layout/Sidebar';
import { logout } from '../features/auth/authSlice';
import { getInitials } from '../utils/helpers';

const DRAWER_WIDTH = 270;
const DRAWER_COLLAPSED_WIDTH = 72;

const DashboardLayout = ({ themeMode, toggleTheme }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const actualWidth = collapsed && !isMobile ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setDrawerOpen(!drawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    dispatch(logout());
    navigate('/login');
  };

  // Generate breadcrumbs from path
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbMap = {
    dashboard: 'Dashboard',
    items: 'Item Master',
    vendors: 'Vendors',
    indents: 'Purchase Indents',
    'purchase-orders': 'Purchase Orders',
    grn: 'GRN',
    inventory: 'Inventory',
    'issue-return': 'Issue & Return',
    assets: 'Assets',
    reports: 'Reports',
    'change-password': 'Change Password',
    new: 'New',
    edit: 'Edit',
  };

  const drawerContent = (
    <Sidebar
      collapsed={collapsed && !isMobile}
      onItemClick={() => isMobile && setDrawerOpen(false)}
    />
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: actualWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: actualWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { md: `calc(100% - ${actualWidth}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ color: 'text.primary' }}
            >
              {collapsed && !isMobile ? <MenuIcon /> : isMobile ? <MenuIcon /> : <ChevronLeft />}
            </IconButton>

            {/* Breadcrumbs */}
            <Breadcrumbs
              separator="›"
              sx={{
                flex: 1,
                '& .MuiBreadcrumbs-separator': {
                  color: 'text.secondary',
                  mx: 0.5,
                },
              }}
            >
              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const label = breadcrumbMap[value] || value;

                return isLast ? (
                  <Typography
                    key={to}
                    variant="subtitle2"
                    color="text.primary"
                    fontWeight={600}
                  >
                    {label}
                  </Typography>
                ) : (
                  <Link
                    key={to}
                    underline="hover"
                    color="text.secondary"
                    sx={{ cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => navigate(to)}
                  >
                    {label}
                  </Link>
                );
              })}
            </Breadcrumbs>

            {/* Search */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                backgroundColor: alpha(theme.palette.text.primary, 0.04),
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                mr: 1,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                transition: 'all 0.2s ease',
                '&:focus-within': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <Search sx={{ color: 'text.secondary', fontSize: 20, mr: 0.5 }} />
              <InputBase
                placeholder="Search..."
                sx={{ fontSize: '0.85rem', width: 160 }}
              />
            </Box>

            {/* Theme Toggle */}
            <Tooltip title={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
                {themeMode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={3} color="error" variant="dot">
                  <Notifications fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile */}
            <Tooltip title="Account">
              <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 0.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(135deg, #00BFA6 0%, #7C4DFF 100%)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {getInitials(user?.name)}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={user?.role} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                </Box>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/change-password'); }}>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                Change Password
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
