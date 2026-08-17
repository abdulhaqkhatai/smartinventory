import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Card, CardContent, Grid, Button, TextField, Autocomplete, Chip, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { addStockMovement, fetchStockMovements, fetchStockLevels, fetchLowStockItems } from './inventorySlice';
import { mockItems } from '../../services/mockData'; // In real app, fetch from itemSlice
import { formatCurrency, formatDate, generateId } from '../../utils/helpers';
import dayjs from 'dayjs';

const InventoryPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useDispatch();
  const { stockMovements, stockLevels, loading } = useSelector(state => state.inventory);
  const { enqueueSnackbar } = useSnackbar();
  
  const [adjForm, setAdjForm] = useState({ item: null, type: 'Adjustment', qty: '', reason: '' });

  useEffect(() => {
    dispatch(fetchStockMovements());
    dispatch(fetchStockLevels());
    dispatch(fetchLowStockItems());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const getStockColor = (current, reorder) => {
    if (current <= 0) return 'error';
    if (current <= reorder) return 'warning';
    return 'success';
  };

  const itemColumns = [
    { field: 'code', headerName: 'Code', flex: 1 },
    { field: 'name', headerName: 'Item Name', flex: 2 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'unitPrice', headerName: 'Unit Price', flex: 1, valueFormatter: (params) => formatCurrency(params.value) },
    { 
      field: 'currentStock', 
      headerName: 'Current Stock', 
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStockColor(params.value, params.row.reorderLevel)} 
          size="small" 
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    { field: 'reorderLevel', headerName: 'Reorder Lvl', flex: 1 },
  ];

  const movementColumns = [
    { field: 'date', headerName: 'Date', flex: 1, valueFormatter: (params) => formatDate(params.value) },
    { field: 'type', headerName: 'Type', flex: 1, renderCell: (params) => <Chip label={params.value} size="small" /> },
    { field: 'itemName', headerName: 'Item Name', flex: 2 },
    { field: 'quantity', headerName: 'Qty', flex: 1 },
    { field: 'reference', headerName: 'Reference', flex: 1 },
    { field: 'performedBy', headerName: 'Performed By', flex: 1 },
  ];

  const lowStockItems = mockItems.filter(item => item.currentStock <= item.reorderLevel);

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    if (!adjForm.item || !adjForm.qty || isNaN(adjForm.qty)) {
      enqueueSnackbar('Please fill all required fields correctly', { variant: 'error' });
      return;
    }

    const newMovement = {
      id: generateId(),
      date: dayjs().format('YYYY-MM-DD'),
      type: 'Adjustment',
      itemName: adjForm.item.name,
      quantity: Number(adjForm.qty),
      reference: `ADJ-${dayjs().format('YYYY')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`,
      warehouse: 'Main Store',
      performedBy: 'Current User' // Mock user
    };

    dispatch(addStockMovement(newMovement));
    enqueueSnackbar('Stock Adjusted Successfully', { variant: 'success' });
    setAdjForm({ item: null, type: 'Adjustment', qty: '', reason: '' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Inventory Management</Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Stock Overview" />
            <Tab label="Stock Movements" />
            <Tab label={`Low Stock (${lowStockItems.length})`} />
            <Tab label="Stock Adjustment" />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6">Total Inventory Value</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(mockItems.reduce((acc, item) => acc + (item.currentStock * item.unitPrice), 0))}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Paper sx={{ height: 600, width: '100%' }}>
              <DataGrid rows={mockItems} columns={itemColumns} />
            </Paper>
          </motion.div>
        )}

        {tabValue === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Paper sx={{ height: 600, width: '100%' }}>
              <DataGrid rows={stockMovements} columns={movementColumns} />
            </Paper>
          </motion.div>
        )}

        {tabValue === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={3}>
              {lowStockItems.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card variant="outlined" sx={{ borderColor: 'error.main', borderWidth: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Code: {item.code}</Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Current Stock</Typography>
                          <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>{item.currentStock}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Reorder Level</Typography>
                          <Typography variant="h5">{item.reorderLevel}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {tabValue === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>Make Stock Adjustment</Typography>
                  <form onSubmit={handleAdjustmentSubmit}>
                    <Autocomplete
                      options={mockItems}
                      getOptionLabel={(option) => option.name}
                      value={adjForm.item}
                      onChange={(e, newValue) => setAdjForm({ ...adjForm, item: newValue })}
                      renderInput={(params) => <TextField {...params} label="Select Item" required sx={{ mb: 3 }} />}
                    />
                    <TextField 
                      fullWidth 
                      label="Adjustment Quantity (use negative for decrease)" 
                      type="number" 
                      value={adjForm.qty}
                      onChange={(e) => setAdjForm({ ...adjForm, qty: e.target.value })}
                      required 
                      sx={{ mb: 3 }}
                    />
                    <TextField 
                      fullWidth 
                      label="Reason for adjustment" 
                      multiline 
                      rows={3} 
                      value={adjForm.reason}
                      onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                      required 
                      sx={{ mb: 3 }}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>Submit Adjustment</Button>
                  </form>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>Recent Adjustments</Typography>
                <Paper sx={{ p: 0 }}>
                  <DataGrid 
                    rows={stockMovements.filter(m => m.type === 'Adjustment')} 
                    columns={movementColumns} 
                    hideFooter
                    autoHeight
                  />
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );
};

export default InventoryPage;
