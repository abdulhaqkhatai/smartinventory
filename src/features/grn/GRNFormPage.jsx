import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, MenuItem, Grid, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { addGRN } from './grnSlice';
import { generateId, formatDate } from '../../utils/helpers';
import dayjs from 'dayjs';

// We should ideally fetch POs from a poSlice, but we'll import mock data directly if needed, or assume it's available.
// For now, importing from mockData for dropdown.
import { mockPurchaseOrders } from '../../services/mockData';
import api from '../../services/api';

const GRNFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const pendingPOs = mockPurchaseOrders.filter(po => po.status === 'pending');
  
  const [selectedPOId, setSelectedPOId] = useState('');
  const [formData, setFormData] = useState({
    receivedBy: 'Rajesh Kumar', // Mock logged in user
    date: dayjs().format('YYYY-MM-DD'),
    remarks: ''
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (selectedPOId) {
      const po = pendingPOs.find(p => p.id === selectedPOId);
      if (po) {
        setItems(po.items.map(item => ({
          ...item,
          orderedQty: item.quantity,
          receivedQty: item.quantity,
          damagedQty: 0,
          acceptedQty: item.quantity
        })));
      }
    } else {
      setItems([]);
    }
  }, [selectedPOId]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = Number(value) || 0;
    
    if (field === 'receivedQty' || field === 'damagedQty') {
      const received = field === 'receivedQty' ? (Number(value) || 0) : newItems[index].receivedQty;
      const damaged = field === 'damagedQty' ? (Number(value) || 0) : newItems[index].damagedQty;
      newItems[index].acceptedQty = Math.max(0, received - damaged);
    }
    
    setItems(newItems);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPOId || items.length === 0) {
      enqueueSnackbar('Please select a PO', { variant: 'warning' });
      return;
    }

    const po = pendingPOs.find(p => p.id === selectedPOId);
    
    // Check if fully or partially received
    const isPartial = items.some(item => item.acceptedQty < item.orderedQty);

    const payload = {
      poRef: po.code,
      vendorName: po.vendorName,
      date: formData.date,
      receivedBy: formData.receivedBy,
      status: isPartial ? 'partial' : 'completed',
      items: items.map(i => ({
        itemId: i.itemId,
        itemName: i.itemName,
        orderedQty: i.orderedQty,
        receivedQty: i.receivedQty,
        damagedQty: i.damagedQty,
        acceptedQty: i.acceptedQty
      })),
      remarks: formData.remarks
    };

    try {
      setIsSubmitting(true);
      const response = await api.post('/grn', payload);
      const createdGRN = response?.data?.data || response?.data;

      // Formatting for Redux Store
      const newGRN = {
        id: createdGRN.id || generateId(),
        code: createdGRN.code || `GRN-${dayjs().format('YYYY')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        poRef: createdGRN.po_ref || payload.poRef,
        vendorName: createdGRN.vendor_name || payload.vendorName,
        date: createdGRN.date || payload.date,
        receivedBy: createdGRN.received_by || payload.receivedBy,
        status: createdGRN.status || payload.status,
        items: typeof createdGRN.items === 'string' ? JSON.parse(createdGRN.items) : (createdGRN.items || payload.items),
        remarks: createdGRN.remarks || payload.remarks
      };

      dispatch(addGRN(newGRN));
      enqueueSnackbar('GRN Created Successfully', { variant: 'success' });
      navigate('/grn');
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message || 'Failed to create GRN', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Create Goods Receipt Note</Typography>
        
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Select Purchase Order"
                  value={selectedPOId}
                  onChange={(e) => setSelectedPOId(e.target.value)}
                  required
                >
                  {pendingPOs.map(po => (
                    <MenuItem key={po.id} value={po.id}>{po.code} - {po.vendorName}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                 <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Received By"
                  value={formData.receivedBy}
                  onChange={(e) => setFormData({...formData, receivedBy: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                />
              </Grid>
            </Grid>

            {items.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>Items Received</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell align="right">Ordered Qty</TableCell>
                        <TableCell align="right">Received Qty</TableCell>
                        <TableCell align="right">Damaged Qty</TableCell>
                        <TableCell align="right">Accepted Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell align="right">{item.orderedQty}</TableCell>
                          <TableCell align="right">
                            <TextField 
                              type="number"
                              size="small"
                              value={item.receivedQty}
                              onChange={(e) => handleItemChange(index, 'receivedQty', e.target.value)}
                              inputProps={{ min: 0 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField 
                              type="number"
                              size="small"
                              value={item.damagedQty}
                              onChange={(e) => handleItemChange(index, 'damagedQty', e.target.value)}
                              inputProps={{ min: 0 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {item.acceptedQty}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/grn')}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Submit GRN</Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default GRNFormPage;
