import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip, IconButton, CircularProgress } from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { fetchGRNs } from './grnSlice';

const GRNListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { grns, loading } = useSelector(state => state.grn);
  const [filter, setFilter] = useState('all'); // all, completed, partial

  useEffect(() => {
    dispatch(fetchGRNs());
  }, [dispatch]);

  const filteredGRNs = grns.filter(grn => {
    if (filter === 'all') return true;
    return grn.status === filter;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const columns = [
    { field: 'code', headerName: 'GRN Code', flex: 1 },
    { 
      field: 'poRef', 
      headerName: 'PO Ref', 
      flex: 1,
      valueGetter: (value, row) => row?.poRef || row?.po_ref || ''
    },
    { 
      field: 'vendorName', 
      headerName: 'Vendor', 
      flex: 1.5,
      valueGetter: (value, row) => row?.vendorName || row?.vendor_name || '' 
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      flex: 1, 
      valueGetter: (value, row) => row?.date ? formatDate(row.date) : '' 
    },
    { 
      field: 'receivedBy', 
      headerName: 'Received By', 
      flex: 1,
      valueGetter: (value, row) => row?.receivedBy || row?.received_by || '' 
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} 
          color={getStatusColor(params.value)} 
          size="small" 
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => navigate(`/grn/${params.row.id}`)}>
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Goods Receipt Notes</Typography>
            <Typography variant="subtitle1" color="text.secondary">Total: {filteredGRNs.length} GRNs</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/grn/new')}
          >
            Create GRN
          </Button>
        </Box>

        <Box sx={{ mb: 2 }}>
           <Button variant={filter === 'all' ? 'contained' : 'outlined'} sx={{ mr: 1 }} onClick={() => setFilter('all')}>All</Button>
           <Button variant={filter === 'completed' ? 'contained' : 'outlined'} color="success" sx={{ mr: 1 }} onClick={() => setFilter('completed')}>Completed</Button>
           <Button variant={filter === 'partial' ? 'contained' : 'outlined'} color="warning" onClick={() => setFilter('partial')}>Partial</Button>
        </Box>

        <Paper sx={{ height: 600, width: '100%', bgcolor: 'background.paper' }}>
          <DataGrid
            rows={filteredGRNs}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': { borderColor: 'divider' },
              '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default', borderColor: 'divider' }
            }}
          />
        </Paper>
      </Box>
    </motion.div>
  );
};

export default GRNListPage;
