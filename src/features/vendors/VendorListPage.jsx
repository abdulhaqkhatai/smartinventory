import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, TextField, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Paper, Rating } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { deleteVendorAsync, setSelectedVendor, fetchVendors, clearError } from './vendorsSlice';
import VendorFormDialog from './VendorFormDialog';
import { useSnackbar } from 'notistack';

const VendorListPage = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { vendors, loading, error } = useSelector(state => state.vendors);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch, enqueueSnackbar]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const name = v.name || '';
      const contactPerson = v.contact_person || v.contactPerson || '';
      const email = v.email || '';
      const phone = v.phone || '';
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  const handleEdit = (vendor) => {
    dispatch(setSelectedVendor(vendor));
    setFormOpen(true);
  };

  const handleDeleteClick = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (vendorToDelete) {
      dispatch(deleteVendorAsync(vendorToDelete.id));
      enqueueSnackbar('Vendor deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'blacklisted': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    {
      field: 'contact_person',
      headerName: 'Contact Person',
      width: 160,
      valueGetter: (value, row) => row.contact_person || row.contactPerson || '',
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 130,
      valueGetter: (value, row) => row.phone || '',
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 180,
      valueGetter: (value, row) => row.email || '',
    },
    {
      field: 'gst_number',
      headerName: 'GST No',
      width: 150,
      valueGetter: (value, row) => row.gst_number || row.gst || '',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'active'}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 130,
      renderCell: (params) => (
        <Rating value={Number(params.value) || 0} readOnly size="small" precision={0.5} />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(params.row)} color="primary" title="Edit Vendor">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteClick(params.row)} color="error" title="Delete Vendor">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00BFA6' }}>Vendor Management</Typography>
          <Typography variant="subtitle1" color="text.secondary">Total Vendors: {vendors.length}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { dispatch(setSelectedVendor(null)); setFormOpen(true); }}
          sx={{ bgcolor: '#00BFA6', '&:hover': { bgcolor: alpha('#00BFA6', 0.8) } }}
        >
          Add Vendor
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2, bgcolor: '#132F4C', borderRadius: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by vendor name, contact person, email, phone..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
          sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { bgcolor: alpha('#0A1929', 0.5) } }}
        />
        <TextField
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { bgcolor: alpha('#0A1929', 0.5) } }}
          SelectProps={{ native: true }}
        >
          <option value="All">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blacklisted">Blacklisted</option>
        </TextField>
      </Paper>

      <Box sx={{ flexGrow: 1, bgcolor: '#132F4C', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={filteredVendors}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderColor: alpha('#fff', 0.1) },
            '& .MuiDataGrid-columnHeaders': { bgcolor: alpha('#0A1929', 0.8), borderColor: alpha('#fff', 0.1) },
            '& .MuiDataGrid-footerContainer': { borderColor: alpha('#fff', 0.1) }
          }}
        />
      </Box>

      <VendorFormDialog open={formOpen} onClose={() => setFormOpen(false)} />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#132F4C', color: '#fff' } }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete vendor {vendorToDelete?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorListPage;
