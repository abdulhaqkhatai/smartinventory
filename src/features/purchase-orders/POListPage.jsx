import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';


import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {
  formatDate,
  getStatusColor,
  formatCurrency,
} from '../../utils/helpers';

import { fetchPurchaseOrders } from './purchaseOrdersSlice';

const POListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { purchaseOrders, loading } = useSelector(
    (state) => state.purchaseOrders
  );

  const [filter, setFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
  }, [dispatch]);

  const statuses = [
    'All',
    'Pending',
    'Completed',
    'Cancelled',
  ];

  const getCount = (status) => {
    if (status === 'All') {
      return purchaseOrders.length;
    }

    return purchaseOrders.filter(
      (po) => po.status === status
    ).length;
  };

  const filteredPOs =
    filter === 'All'
      ? purchaseOrders
      : purchaseOrders.filter(
          (po) => po.status === filter
        );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const columns = [
    {
      field: 'poCode',
      headerName: 'PO Code',
      flex: 1,
      valueGetter: (value, row) => {
        return row?.poCode || row?.code || '';
      },
    },

    {
      field: 'vendor',
      headerName: 'Vendor',
      flex: 1.5,

      // MUI X DataGrid current valueGetter syntax
      valueGetter: (value, row) => {
        return row?.vendor?.name || row?.vendorName || row?.vendor_name || '';
      },
    },

    {
      field: 'indentRef',
      headerName: 'Indent Ref',
      flex: 1,
      valueGetter: (value, row) => {
        return row?.indentRef || row?.indent_ref || '';
      },
    },

    {
      field: 'date',
      headerName: 'Date',
      flex: 1,

      valueGetter: (value, row) => {
        return row?.date ? formatDate(row.date) : '';
      },
    },

    {
      field: 'deliveryDate',
      headerName: 'Delivery Date',
      flex: 1,

      valueGetter: (value, row) => {
        const d = row?.deliveryDate || row?.delivery_date;
        return d ? formatDate(d) : '';
      },
    },

    {
      field: 'totalAmount',
      headerName: 'Total Amount (INR)',
      flex: 1,

      valueGetter: (value, row) => {
        const amt = row?.totalAmount != null ? row.totalAmount : row?.total_amount;
        return amt != null ? formatCurrency(amt) : '';
      },
    },

    {
      field: 'status',
      headerName: 'Status',
      flex: 1,

      renderCell: (params) => (
        <Chip
          label={params.value || ''}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },

    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,

      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <IconButton
          onClick={() =>
            navigate(
              `/purchase-orders/${params.row.id}`
            )
          }
          size="small"
          color="primary"
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ p: 3 }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold' }}
        >
          Purchase Orders ({purchaseOrders.length})
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate('/purchase-orders/new')
          }
          sx={{ borderRadius: 2 }}
        >
          Create PO
        </Button>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        {statuses.map((status) => (
          <Chip
            key={status}
            label={`${status} (${getCount(status)})`}
            clickable
            color={
              filter === status
                ? 'primary'
                : 'default'
            }
            onClick={() => setFilter(status)}
            variant={
              filter === status
                ? 'filled'
                : 'outlined'
            }
          />
        ))}
      </Box>

      {/* Data Grid */}
      <Box
        sx={{
          height: 600,
          width: '100%',
          background:
            'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          p: 1,
        }}
      >
        <DataGrid
          rows={filteredPOs}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',

            '& .MuiDataGrid-cell': {
              borderBottom:
                '1px solid rgba(255,255,255,0.1)',
            },

            '& .MuiDataGrid-columnHeaders': {
              borderBottom:
                '1px solid rgba(255,255,255,0.2)',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default POListPage;