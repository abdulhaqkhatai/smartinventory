import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Autocomplete, IconButton, Typography, Box } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { addIssue } from './issueReturnSlice';
import { generateId } from '../../utils/helpers';
import dayjs from 'dayjs';
import { mockItems } from '../../services/mockData';

const IssueFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const initialForm = {
    issuedTo: '',
    department: '',
    date: dayjs().format('YYYY-MM-DD'),
    remarks: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [items, setItems] = useState([{ item: null, qty: 1 }]);

  const handleAddItem = () => {
    setItems([...items, { item: null, qty: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (items.some(i => !i.item || i.qty <= 0)) {
      enqueueSnackbar('Please select items and valid quantities.', { variant: 'error' });
      return;
    }

    const newIssue = {
      id: generateId(),
      code: `ISS-${dayjs().format('YYYY')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`,
      date: formData.date,
      issuedTo: formData.issuedTo,
      department: formData.department,
      issuedBy: 'Rajesh Kumar', // mock current user
      status: 'issued',
      remarks: formData.remarks,
      items: items.map(i => ({
        itemName: i.item.name,
        quantity: Number(i.qty)
      }))
    };

    dispatch(addIssue(newIssue));
    enqueueSnackbar('Items Issued Successfully', { variant: 'success' });
    setFormData(initialForm);
    setItems([{ item: null, qty: 1 }]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Issue Items</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Issue To" value={formData.issuedTo} onChange={e => setFormData({...formData, issuedTo: e.target.value})} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Remarks" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>Items to Issue</Typography>
          {items.map((row, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
              <Autocomplete
                sx={{ flex: 2 }}
                options={mockItems}
                getOptionLabel={(option) => option.name}
                value={row.item}
                onChange={(e, newValue) => handleItemChange(index, 'item', newValue)}
                renderInput={(params) => <TextField {...params} label="Select Item" required />}
              />
              <TextField
                sx={{ flex: 1 }}
                type="number"
                label="Quantity"
                value={row.qty}
                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                inputProps={{ min: 1 }}
                required
              />
              <IconButton color="error" onClick={() => handleRemoveItem(index)} disabled={items.length === 1} sx={{ mt: 1 }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={handleAddItem}>Add Another Item</Button>

        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">Issue</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IssueFormDialog;
