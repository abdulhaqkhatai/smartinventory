import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { createItem, updateItemAsync, setSelectedItem } from './itemsSlice';
import { mockCategories, mockUnits } from '../../services/mockData';
import { alpha } from '@mui/material/styles';

const schema = yup.object().shape({
  code: yup.string(),
  name: yup.string().required('Item name is required').min(3, 'Minimum 3 characters required'),
  category: yup.string().required('Category is required'),
  brand: yup.string(),
  unit: yup.string().required('Unit is required'),
  hsn_code: yup.string(),
  gst_rate: yup.number().typeError('Must be a number').min(0, 'Min 0').max(28, 'Max 28').required('GST rate is required'),
  min_stock: yup.number().typeError('Must be a number').min(0, 'Min 0').default(0),
  reorder_level: yup.number().typeError('Must be a number').min(0, 'Min 0').required('Reorder level required'),
  max_stock: yup.number().typeError('Must be a number').required('Max stock required'),
  unit_price: yup.number().typeError('Must be a number').positive('Must be positive').required('Unit price required'),
  image_url: yup.string().url('Must be a valid URL').nullable().transform((v) => (v === '' ? null : v)),
});

const ItemFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedItem, loading } = useSelector(state => state.items);
  const isEdit = Boolean(selectedItem);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      category: '',
      brand: '',
      unit: 'Piece',
      hsn_code: '',
      gst_rate: 18,
      min_stock: 0,
      reorder_level: 10,
      max_stock: 100,
      unit_price: 0,
      image_url: '',
    }
  });

  useEffect(() => {
    if (selectedItem && open) {
      reset({
        code: selectedItem.code || '',
        name: selectedItem.name || '',
        category: selectedItem.category || '',
        brand: selectedItem.brand || '',
        unit: selectedItem.unit || 'Piece',
        hsn_code: selectedItem.hsn_code || selectedItem.hsn || '',
        gst_rate: selectedItem.gst_rate ?? selectedItem.gstRate ?? 18,
        min_stock: selectedItem.min_stock ?? selectedItem.minStock ?? 0,
        reorder_level: selectedItem.reorder_level ?? selectedItem.reorderLevel ?? 10,
        max_stock: selectedItem.max_stock ?? selectedItem.maxStock ?? 100,
        unit_price: selectedItem.unit_price ?? selectedItem.unitPrice ?? 0,
        image_url: selectedItem.image_url || '',
      });
    } else if (open) {
      reset({
        code: '',
        name: '',
        category: '',
        brand: '',
        unit: 'Piece',
        hsn_code: '',
        gst_rate: 18,
        min_stock: 0,
        reorder_level: 10,
        max_stock: 100,
        unit_price: 0,
        image_url: '',
      });
    }
  }, [selectedItem, open, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await dispatch(updateItemAsync({ id: selectedItem.id, itemData: data })).unwrap();
        enqueueSnackbar('Item updated successfully', { variant: 'success' });
      } else {
        await dispatch(createItem(data)).unwrap();
        enqueueSnackbar('Item added successfully', { variant: 'success' });
      }
      dispatch(setSelectedItem(null));
      onClose();
    } catch (error) {
      enqueueSnackbar(error || 'Failed to save item', { variant: 'error' });
    }
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
            <Grid item xs={12} sm={4}>
              <Controller name="code" control={control} render={({ field }) => (
                <TextField {...field} label="Item Code (e.g. ITM-0001)" placeholder="Auto-generated if blank" fullWidth error={!!errors.code} helperText={errors.code?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Item Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="category" control={control} render={({ field }) => (
                <TextField {...field} select label="Category" fullWidth error={!!errors.category} helperText={errors.category?.message}>
                  {mockCategories.map(c => {
                    const catName = typeof c === 'object' ? c.name : c;
                    return <MenuItem key={catName} value={catName}>{catName}</MenuItem>;
                  })}
                </TextField>
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="brand" control={control} render={({ field }) => (
                <TextField {...field} label="Brand" fullWidth error={!!errors.brand} helperText={errors.brand?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="unit" control={control} render={({ field }) => (
                <TextField {...field} select label="Unit" fullWidth error={!!errors.unit} helperText={errors.unit?.message}>
                  {mockUnits.map(u => {
                    const unitName = typeof u === 'object' ? (u.code || u.name) : u;
                    return <MenuItem key={unitName} value={unitName}>{unitName}</MenuItem>;
                  })}
                </TextField>
              )} />
            </Grid>

            {/* Pricing & Tax */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Pricing & Tax</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="hsn_code" control={control} render={({ field }) => (
                <TextField {...field} label="HSN Code" fullWidth error={!!errors.hsn_code} helperText={errors.hsn_code?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="gst_rate" control={control} render={({ field }) => (
                <TextField {...field} label="GST Rate (%)" type="number" fullWidth error={!!errors.gst_rate} helperText={errors.gst_rate?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="unit_price" control={control} render={({ field }) => (
                <TextField {...field} label="Unit Price (₹)" type="number" fullWidth error={!!errors.unit_price} helperText={errors.unit_price?.message} />
              )} />
            </Grid>

            {/* Inventory Rules */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Inventory Rules</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="min_stock" control={control} render={({ field }) => (
                <TextField {...field} label="Min Stock" type="number" fullWidth error={!!errors.min_stock} helperText={errors.min_stock?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="reorder_level" control={control} render={({ field }) => (
                <TextField {...field} label="Reorder Level" type="number" fullWidth error={!!errors.reorder_level} helperText={errors.reorder_level?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="max_stock" control={control} render={({ field }) => (
                <TextField {...field} label="Max Stock" type="number" fullWidth error={!!errors.max_stock} helperText={errors.max_stock?.message} />
              )} />
            </Grid>

            {/* Media */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Media / Image</Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller name="image_url" control={control} render={({ field }) => (
                <TextField {...field} label="Image URL" placeholder="https://example.com/image.jpg" fullWidth error={!!errors.image_url} helperText={errors.image_url?.message} />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha('#fff', 0.1)}` }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#00BFA6', '&:hover': { bgcolor: alpha('#00BFA6', 0.8) } }} disabled={loading}>
            {isEdit ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ItemFormDialog;
