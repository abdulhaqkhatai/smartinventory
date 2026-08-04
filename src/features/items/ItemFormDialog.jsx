import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Box, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { addItem, updateItem } from './itemsSlice';
import { mockCategories, mockUnits } from '../../services/mockData';
import { generateId } from '../../utils/helpers';
import { alpha } from '@mui/material/styles';

const schema = yup.object().shape({
  name: yup.string().required('Item name is required').min(3, 'Minimum 3 characters required'),
  category: yup.string().required('Category is required'),
  brand: yup.string(),
  unit: yup.string().required('Unit is required'),
  hsn: yup.string(),
  gstRate: yup.number().typeError('Must be a number').min(0, 'Min 0').max(28, 'Max 28').required('GST rate is required'),
  reorderLevel: yup.number().typeError('Must be a number').positive('Must be > 0').required('Reorder level required'),
  minStock: yup.number().typeError('Must be a number').required('Min stock required'),
  maxStock: yup.number().typeError('Must be a number').required('Max stock required').moreThan(yup.ref('minStock'), 'Max stock must be > Min stock'),
  unitPrice: yup.number().typeError('Must be a number').positive('Must be positive').required('Unit price required'),
});

const ItemFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedItem } = useSelector(state => state.items);
  const isEdit = Boolean(selectedItem);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      category: '',
      brand: '',
      unit: '',
      hsn: '',
      gstRate: 18,
      reorderLevel: 10,
      minStock: 5,
      maxStock: 100,
      unitPrice: 0,
    }
  });

  useEffect(() => {
    if (selectedItem && open) {
      reset({
        name: selectedItem.name,
        category: selectedItem.category,
        brand: selectedItem.brand,
        unit: selectedItem.unit,
        hsn: selectedItem.hsn,
        gstRate: selectedItem.gstRate,
        reorderLevel: selectedItem.reorderLevel,
        minStock: selectedItem.minStock,
        maxStock: selectedItem.maxStock,
        unitPrice: selectedItem.unitPrice,
      });
    } else if (open) {
      reset({
        name: '', category: '', brand: '', unit: '', hsn: '', gstRate: 18, reorderLevel: 10, minStock: 5, maxStock: 100, unitPrice: 0,
      });
    }
  }, [selectedItem, open, reset]);

  const onSubmit = (data) => {
    if (isEdit) {
      dispatch(updateItem({ ...selectedItem, ...data }));
      enqueueSnackbar('Item updated successfully', { variant: 'success' });
    } else {
      const newItem = {
        id: generateId(),
        code: `ITM${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        currentStock: 0,
        ...data,
      };
      dispatch(addItem(newItem));
      enqueueSnackbar('Item added successfully', { variant: 'success' });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#132F4C', backgroundImage: 'none' } }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${alpha('#fff', 0.1)}`, color: '#00BFA6' }}>
        {isEdit ? 'Edit Item' : 'Add New Item'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Basic Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Item Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="category" control={control} render={({ field }) => (
                <TextField {...field} select label="Category" fullWidth error={!!errors.category} helperText={errors.category?.message}>
                  {mockCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="brand" control={control} render={({ field }) => (
                <TextField {...field} label="Brand" fullWidth error={!!errors.brand} helperText={errors.brand?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="unit" control={control} render={({ field }) => (
                <TextField {...field} select label="Unit" fullWidth error={!!errors.unit} helperText={errors.unit?.message}>
                  {mockUnits.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </TextField>
              )} />
            </Grid>

            {/* Pricing & Tax */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Pricing & Tax</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="unitPrice" control={control} render={({ field }) => (
                <TextField {...field} label="Unit Price" type="number" fullWidth error={!!errors.unitPrice} helperText={errors.unitPrice?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="hsn" control={control} render={({ field }) => (
                <TextField {...field} label="HSN Code" fullWidth error={!!errors.hsn} helperText={errors.hsn?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="gstRate" control={control} render={({ field }) => (
                <TextField {...field} label="GST Rate (%)" type="number" fullWidth error={!!errors.gstRate} helperText={errors.gstRate?.message} />
              )} />
            </Grid>

            {/* Inventory Rules */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Inventory Rules</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="reorderLevel" control={control} render={({ field }) => (
                <TextField {...field} label="Reorder Level" type="number" fullWidth error={!!errors.reorderLevel} helperText={errors.reorderLevel?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="minStock" control={control} render={({ field }) => (
                <TextField {...field} label="Min Stock" type="number" fullWidth error={!!errors.minStock} helperText={errors.minStock?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="maxStock" control={control} render={({ field }) => (
                <TextField {...field} label="Max Stock" type="number" fullWidth error={!!errors.maxStock} helperText={errors.maxStock?.message} />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha('#fff', 0.1)}` }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#00BFA6', '&:hover': { bgcolor: alpha('#00BFA6', 0.8) } }}>
            {isEdit ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ItemFormDialog;
