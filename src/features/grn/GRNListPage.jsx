import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDate, getStatusColor } from '../../utils/helpers';

const GRNListPage = () => {
  const navigate = useNavigate();
  const { grns } = useSelector(state => state.grn);
  const [filter, setFilter] = useState('all'); // all, completed, partial

  const filteredGRNs = grns.filter(grn => {
    if (filter === 'all') return true;
    return grn.status === filter;
  });

  const columns = [
    { field: 'code', headerName: 'GRN Code', flex: 1 },
    { field: 'poRef', headerName: 'PO Ref', flex: 1 },
    { field: 'vendorName', headerName: 'Vendor', flex: 1.5 },
    { field: 'date', headerName: 'Date', flex: 1, valueFormatter: (params) => formatDate(params.value) },
    { field: 'receivedBy', headerName: 'Received By', flex: 1 },
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
