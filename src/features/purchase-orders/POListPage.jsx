import React, { useState } from 'react';
import { Box, Typography, Button, Chip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatDate, getStatusColor, formatCurrency } from '../../utils/helpers';

const POListPage = () => {
  const { purchaseOrders } = useSelector((state) => state.purchaseOrders);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const statuses = ['All', 'Pending', 'Completed', 'Cancelled'];
  
  const getCount = (status) => {
    if (status === 'All') return purchaseOrders.length;
    return purchaseOrders.filter(po => po.status === status).length;
  };

  const filteredPOs = filter === 'All' 
    ? purchaseOrders 
    : purchaseOrders.filter(po => po.status === filter);

  const columns = [
    { field: 'poCode', headerName: 'PO Code', flex: 1 },
    { field: 'vendor', headerName: 'Vendor', flex: 1.5, valueGetter: (params) => params.row.vendor?.name || '' },
    { field: 'indentRef', headerName: 'Indent Ref', flex: 1 },
    { 
      field: 'date', 
      headerName: 'Date', 
      flex: 1,
      valueGetter: (params) => formatDate(params.row.date)
    },
    { 
      field: 'deliveryDate', 
      headerName: 'Delivery Date', 
      flex: 1,
      valueGetter: (params) => formatDate(params.row.deliveryDate)
    },
    { 
      field: 'totalAmount', 
      headerName: 'Total Amount (INR)', 
      flex: 1,
      valueGetter: (params) => formatCurrency(params.row.totalAmount)
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value)} 
          size="small" 
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params) => (
        <IconButton onClick={() => navigate(`/purchase-orders/${params.row.id}`)} size="small" color="primary">
          <VisibilityIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Purchase Orders ({purchaseOrders.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/purchase-orders/new')}
          sx={{ borderRadius: 2 }}
        >
          Create PO
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {statuses.map(status => (
          <Chip
            key={status}
            label={`${status} (${getCount(status)})`}
            clickable
            color={filter === status ? 'primary' : 'default'}
            onClick={() => setFilter(status)}
            variant={filter === status ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      <Box sx={{ height: 600, width: '100%', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', borderRadius: 2, p: 1 }}>
        <DataGrid
          rows={filteredPOs}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.1)' },
            '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid rgba(255,255,255,0.2)' },
          }}
        />
      </Box>
    </Box>
  );
};

export default POListPage;
