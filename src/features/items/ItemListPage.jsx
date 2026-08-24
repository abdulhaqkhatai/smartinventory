import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, TextField, MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Paper, Avatar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Inventory2 as InventoryIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import { mockCategories } from '../../services/mockData';
import { deleteItemAsync, setSelectedItem, fetchItems, clearError } from './itemsSlice';
import ItemFormDialog from './ItemFormDialog';
import { useSnackbar } from 'notistack';

const ItemListPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { items, loading, error } = useSelector(state => state.items);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch, enqueueSnackbar]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const code = item.code || '';
      const name = item.name || '';
      const brand = item.brand || '';
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, categoryFilter]);

  const handleEdit = (item) => {
    dispatch(setSelectedItem(item));
    setFormOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      dispatch(deleteItemAsync(itemToDelete.id));
      enqueueSnackbar('Item deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const columns = [
    {
      field: 'image',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.imageUrl || params.row.image_url}
          alt={params.row.name}
          sx={{ width: 36, height: 36, bgcolor: alpha('#00BFA6', 0.2), color: '#00BFA6' }}
        >
          <InventoryIcon fontSize="small" />
        </Avatar>
      ),
    },
    { field: 'code', headerName: 'Code', width: 110 },
    { field: 'name', headerName: 'Item Name', flex: 1, minWidth: 200 },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'unit', headerName: 'Unit', width: 80 },
    { field: 'hsn', headerName: 'HSN', width: 100 },
    {
      field: 'gstRate',
      headerName: 'GST %',
      width: 90,
      renderCell: (params) => `${params.value ?? 18}%`,
    },
    {
      field: 'currentStock',
      headerName: 'Stock',
      width: 120,
      renderCell: (params) => {
        const currentStock = params.row.currentStock ?? params.row.quantity_in_stock ?? 0;
        const reorderLevel = params.row.reorderLevel ?? params.row.reorder_level ?? 0;
        let color = 'success';
        if (currentStock <= reorderLevel) {
          color = 'error';
        } else if (currentStock <= reorderLevel * 1.5) {
          color = 'warning';
        }
        return (
          <Chip
            label={currentStock}
            color={color}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        );
      }
    },
    {
      field: 'unitPrice',
      headerName: 'Price',
      width: 130,
      renderCell: (params) => formatCurrency(params.value ?? 0)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(params.row)} color="primary" title="Edit Item">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteClick(params.row)} color="error" title="Delete Item">
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
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00BFA6' }}>Item Master</Typography>
          <Typography variant="subtitle1" color="text.secondary">Total Items: {items.length}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { dispatch(setSelectedItem(null)); setFormOpen(true); }}
          sx={{ bgcolor: '#00BFA6', '&:hover': { bgcolor: alpha('#00BFA6', 0.8) } }}
        >
          Add Item
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2, bgcolor: '#132F4C', borderRadius: 2, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by code, name, brand..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
          sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { bgcolor: alpha('#0A1929', 0.5) } }}
        />
        <TextField
          select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: alpha('#0A1929', 0.5) } }}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {mockCategories.map(cat => {
            const catName = typeof cat === 'object' ? cat.name : cat;
            return (
              <MenuItem key={catName} value={catName}>
                {catName}
              </MenuItem>
            );
          })}
        </TextField>
      </Paper>

      <Box sx={{ flexGrow: 1, bgcolor: '#132F4C', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={filteredItems}
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

      <ItemFormDialog open={formOpen} onClose={() => setFormOpen(false)} />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#132F4C', color: '#fff' } }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
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

export default ItemListPage;
