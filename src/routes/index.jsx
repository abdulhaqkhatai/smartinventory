import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from '../features/auth/ProtectedRoute';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const ChangePasswordPage = lazy(() => import('../features/auth/ChangePasswordPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const ItemListPage = lazy(() => import('../features/items/ItemListPage'));
const VendorListPage = lazy(() => import('../features/vendors/VendorListPage'));
const IndentListPage = lazy(() => import('../features/indents/IndentListPage'));
const IndentFormPage = lazy(() => import('../features/indents/IndentFormPage'));
const IndentDetailPage = lazy(() => import('../features/indents/IndentDetailPage'));
const POListPage = lazy(() => import('../features/purchase-orders/POListPage'));
const POFormPage = lazy(() => import('../features/purchase-orders/POFormPage'));
const PODetailPage = lazy(() => import('../features/purchase-orders/PODetailPage'));
const GRNListPage = lazy(() => import('../features/grn/GRNListPage'));
const GRNFormPage = lazy(() => import('../features/grn/GRNFormPage'));
const GRNDetailPage = lazy(() => import('../features/grn/GRNDetailPage'));
const InventoryPage = lazy(() => import('../features/inventory/InventoryPage'));
const IssueReturnPage = lazy(() => import('../features/issue-return/IssueReturnPage'));
const AssetListPage = lazy(() => import('../features/assets/AssetListPage'));
const AssetDetailPage = lazy(() => import('../features/assets/AssetDetailPage'));
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'));
const ReportViewPage = lazy(() => import('../features/reports/ReportViewPage'));

// Loading fallback
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress sx={{ color: '#00BFA6' }} />
  </Box>
);

const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// This function creates routes that need to be used inside App.jsx
// with DashboardLayout wrapping the protected routes
export const getRoutes = (DashboardLayout, themeMode, toggleTheme) => {
  return createBrowserRouter([
    {
      path: '/login',
      element: (
        <LazyPage>
          <LoginPage />
        </LazyPage>
      ),
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <DashboardLayout themeMode={themeMode} toggleTheme={toggleTheme} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        {
          path: 'dashboard',
          element: <LazyPage><DashboardPage /></LazyPage>,
        },
        {
          path: 'change-password',
          element: <LazyPage><ChangePasswordPage /></LazyPage>,
        },
        // Items
        {
          path: 'items',
          element: <LazyPage><ItemListPage /></LazyPage>,
        },
        // Vendors
        {
          path: 'vendors',
          element: <LazyPage><VendorListPage /></LazyPage>,
        },
        // Indents
        {
          path: 'indents',
          element: <LazyPage><IndentListPage /></LazyPage>,
        },
        {
          path: 'indents/new',
          element: <LazyPage><IndentFormPage /></LazyPage>,
        },
        {
          path: 'indents/:id/edit',
          element: <LazyPage><IndentFormPage /></LazyPage>,
        },
        {
          path: 'indents/:id',
          element: <LazyPage><IndentDetailPage /></LazyPage>,
        },
        // Purchase Orders
        {
          path: 'purchase-orders',
          element: <LazyPage><POListPage /></LazyPage>,
        },
        {
          path: 'purchase-orders/new',
          element: <LazyPage><POFormPage /></LazyPage>,
        },
        {
          path: 'purchase-orders/:id',
          element: <LazyPage><PODetailPage /></LazyPage>,
        },
        // GRN
        {
          path: 'grn',
          element: <LazyPage><GRNListPage /></LazyPage>,
        },
        {
          path: 'grn/new',
          element: <LazyPage><GRNFormPage /></LazyPage>,
        },
        {
          path: 'grn/:id',
          element: <LazyPage><GRNDetailPage /></LazyPage>,
        },
        // Inventory
        {
          path: 'inventory',
          element: <LazyPage><InventoryPage /></LazyPage>,
        },
        // Issue & Return
        {
          path: 'issue-return',
          element: <LazyPage><IssueReturnPage /></LazyPage>,
        },
        // Assets
        {
          path: 'assets',
          element: <LazyPage><AssetListPage /></LazyPage>,
        },
        {
          path: 'assets/:id',
          element: <LazyPage><AssetDetailPage /></LazyPage>,
        },
        // Reports
        {
          path: 'reports',
          element: <LazyPage><ReportsPage /></LazyPage>,
        },
        {
          path: 'reports/:reportType',
          element: <LazyPage><ReportViewPage /></LazyPage>,
        },
      ],
    },
    {
      path: '/unauthorized',
      element: (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ fontSize: '4rem' }}>🔒</Box>
          <Box sx={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Denied</Box>
          <Box sx={{ color: 'text.secondary' }}>You do not have permission to view this page.</Box>
        </Box>
      ),
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />,
    },
  ]);
};
