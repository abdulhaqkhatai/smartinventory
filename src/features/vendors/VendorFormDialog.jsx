import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Box, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { addVendor, updateVendor } from './vendorsSlice';
import { generateId } from '../../utils/helpers';
import { alpha } from '@mui/material/styles';

const schema = yup.object().shape({
  name: yup.string().required('Vendor name is required'),
  status: yup.string().required('Status is required'),
  contactPerson: yup.string().required('Contact person is required'),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string().required('Address is required'),
  gstNo: yup.string().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (e.g. 22AAAAA0000A1Z5)'),
  pan: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  bankName: yup.string(),
  accountNo: yup.string(),
  ifscCode: yup.string(),
});

const VendorFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedVendor } = useSelector(state => state.vendors);
  const isEdit = Boolean(selectedVendor);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '', status: 'Active', contactPerson: '', phone: '', email: '', address: '',
      gstNo: '', pan: '', bankName: '', accountNo: '', ifscCode: ''
    }
  });

  useEffect(() => {
    if (selectedVendor && open) {
      reset({ ...selectedVendor });
    } else if (open) {
      reset({
        name: '', status: 'Active', contactPerson: '', phone: '', email: '', address: '',
        gstNo: '', pan: '', bankName: '', accountNo: '', ifscCode: ''
      });
    }
  }, [selectedVendor, open, reset]);

  const onSubmit = (data) => {
    if (isEdit) {
      dispatch(updateVendor({ ...selectedVendor, ...data }));
      enqueueSnackbar('Vendor updated successfully', { variant: 'success' });
    } else {
      const newVendor = {
        id: generateId(),
        code: `VEN${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        rating: 0,
        totalOrders: 0,
        ...data,
      };
      dispatch(addVendor(newVendor));
      enqueueSnackbar('Vendor added successfully', { variant: 'success' });
    }
    onClose();
  };

  const SectionHeader = ({ title }) => (
    <Grid item xs={12}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, mt: 1, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Typography>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#132F4C', backgroundImage: 'none' } }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${alpha('#fff', 0.1)}`, color: '#00BFA6' }}>
        {isEdit ? 'Edit Vendor' : 'Add New Vendor'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <SectionHeader title="Basic Information" />
            <Grid item xs={12} sm={8}>
              <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Vendor Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="status" control={control} render={({ field }) => (
                <TextField {...field} select label="Status" fullWidth error={!!errors.status} helperText={errors.status?.message}>
                  {['Active', 'Inactive', 'Blacklisted'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              )} />
            </Grid>

            <SectionHeader title="Contact Information" />
            <Grid item xs={12} sm={6}>
              <Controller name="contactPerson" control={control} render={({ field }) => (
                <TextField {...field} label="Contact Person" fullWidth error={!!errors.contactPerson} helperText={errors.contactPerson?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="phone" control={control} render={({ field }) => (
                <TextField {...field} label="Phone Number" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Email Address" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="address" control={control} render={({ field }) => (
                <TextField {...field} label="Address" multiline rows={3} fullWidth error={!!errors.address} helperText={errors.address?.message} />
              )} />
            </Grid>

            <SectionHeader title="Tax Information" />
            <Grid item xs={12} sm={6}>
              <Controller name="gstNo" control={control} render={({ field }) => (
                <TextField {...field} label="GST Number" fullWidth error={!!errors.gstNo} helperText={errors.gstNo?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="pan" control={control} render={({ field }) => (
                <TextField {...field} label="PAN" fullWidth error={!!errors.pan} helperText={errors.pan?.message} />
              )} />
            </Grid>

            <SectionHeader title="Bank Details" />
            <Grid item xs={12} sm={4}>
              <Controller name="bankName" control={control} render={({ field }) => (
                <TextField {...field} label="Bank Name" fullWidth error={!!errors.bankName} helperText={errors.bankName?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="accountNo" control={control} render={({ field }) => (
                <TextField {...field} label="Account Number" fullWidth error={!!errors.accountNo} helperText={errors.accountNo?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="ifscCode" control={control} render={({ field }) => (
                <TextField {...field} label="IFSC Code" fullWidth error={!!errors.ifscCode} helperText={errors.ifscCode?.message} />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha('#fff', 0.1)}` }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#00BFA6', '&:hover': { bgcolor: alpha('#00BFA6', 0.8) } }}>
            {isEdit ? 'Update Vendor' : 'Add Vendor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VendorFormDialog;
