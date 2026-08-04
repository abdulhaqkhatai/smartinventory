import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  Inventory2,
  People,
  ShoppingCart,
  Description,
  LocalShipping,
  Receipt,
  Warehouse,
  SwapHoriz,
  Devices,
  Assessment,
  ExpandLess,
  ExpandMore,
  Circle,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    title: 'Item Master',
    icon: <Inventory2 />,
    path: '/items',
  },
  {
    title: 'Vendors',
    icon: <People />,
    path: '/vendors',
  },
  {
    title: 'Purchase',
    icon: <ShoppingCart />,
    children: [
      { title: 'Indents', path: '/indents' },
      { title: 'Purchase Orders', path: '/purchase-orders' },
    ],
  },
  {
    title: 'GRN',
    icon: <LocalShipping />,
    path: '/grn',
  },
  {
    title: 'Inventory',
    icon: <Warehouse />,
    path: '/inventory',
  },
  {
    title: 'Issue & Return',
    icon: <SwapHoriz />,
    path: '/issue-return',
  },
  {
    title: 'Assets',
    icon: <Devices />,
    path: '/assets',
  },
  {
    title: 'Reports',
    icon: <Assessment />,
    path: '/reports',
  },
];

const Sidebar = ({ collapsed, onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [openMenus, setOpenMenus] = React.useState({ Purchase: true });

  const handleMenuToggle = (title) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleNavigation = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: 1,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: collapsed ? 1.5 : 2.5,
          py: 2,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #00BFA6 0%, #7C4DFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0, 191, 166, 0.3)',
          }}
        >
          <Inventory2 sx={{ fontSize: 22, color: '#fff' }} />
        </Box>
        {!collapsed && (
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Smart Inventory
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Store Management
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mx: 2, mb: 1 }} />

      {/* Navigation */}
      <List
        component="nav"
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: collapsed ? 0.5 : 1,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        {menuItems.map((item) => {
          if (item.children) {
            const isChildActive = item.children.some((child) => isActive(child.path));
            return (
              <React.Fragment key={item.title}>
                <Tooltip title={collapsed ? item.title : ''} placement="right" arrow>
                  <ListItemButton
                    onClick={() => collapsed ? handleNavigation(item.children[0].path) : handleMenuToggle(item.title)}
                    selected={isChildActive}
                    sx={{
                      minHeight: 44,
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: collapsed ? 1.5 : 1.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 40,
                        mr: collapsed ? 0 : 1,
                        justifyContent: 'center',
                        color: isChildActive ? 'primary.light' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            fontWeight: isChildActive ? 600 : 400,
                          }}
                        />
                        {openMenus[item.title] ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
                {!collapsed && (
                  <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.path}
                          onClick={() => handleNavigation(child.path)}
                          selected={isActive(child.path)}
                          sx={{ pl: 4, minHeight: 38 }}
                        >
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <Circle
                              sx={{
                                fontSize: 6,
                                color: isActive(child.path) ? 'primary.main' : 'text.disabled',
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontSize: '0.82rem',
                              fontWeight: isActive(child.path) ? 600 : 400,
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          }

          return (
            <Tooltip key={item.path} title={collapsed ? item.title : ''} placement="right" arrow>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  minHeight: 44,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: collapsed ? 1.5 : 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    mr: collapsed ? 0 : 1,
                    justifyContent: 'center',
                    color: isActive(item.path) ? 'primary.light' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* User Info */}
      {!collapsed && (
        <Box
          sx={{
            mx: 2,
            mb: 1.5,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="caption" fontWeight={600} display="block" sx={{ lineHeight: 1.3 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            {user?.role} • {user?.department}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
