import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { createVendor, updateVendorAsync, setSelectedVendor } from './vendorsSlice';
import { alpha } from '@mui/material/styles';

const schema = yup.object().shape({
  name: yup.string().required('Vendor name is required'),
  status: yup.string().required('Status is required'),
  contact_person: yup.string().required('Contact person is required'),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').nullable().transform((v) => (v === '' ? null : v)),
  address: yup.string(),
  gst_number: yup.string(),
  pan_number: yup.string(),
  bank_name: yup.string(),
  bank_account: yup.string(),
  bank_ifsc: yup.string(),
  city: yup.string(),
  state: yup.string(),
  pincode: yup.string(),
  rating: yup.number().min(1).max(5).default(4),
});

const VendorFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedVendor, loading } = useSelector(state => state.vendors);
  const isEdit = Boolean(selectedVendor);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      status: 'active',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gst_number: '',
      pan_number: '',
      bank_name: '',
      bank_account: '',
      bank_ifsc: '',
      rating: 4,
    }
  });

  useEffect(() => {
    if (selectedVendor && open) {
      reset({
        name: selectedVendor.name || '',
        status: selectedVendor.status || 'active',
        contact_person: selectedVendor.contact_person || selectedVendor.contactPerson || '',
        phone: selectedVendor.phone || '',
        email: selectedVendor.email || '',
        address: selectedVendor.address || '',
        city: selectedVendor.city || '',
        state: selectedVendor.state || '',
        pincode: selectedVendor.pincode || '',
        gst_number: selectedVendor.gst_number || selectedVendor.gst || '',
        pan_number: selectedVendor.pan_number || selectedVendor.pan || '',
        bank_name: selectedVendor.bank_name || selectedVendor.bankName || '',
        bank_account: selectedVendor.bank_account || selectedVendor.accountNo || '',
        bank_ifsc: selectedVendor.bank_ifsc || selectedVendor.ifsc || '',
        rating: selectedVendor.rating || 4,
      });
    } else if (open) {
      reset({
        name: '',
        status: 'active',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gst_number: '',
        pan_number: '',
        bank_name: '',
        bank_account: '',
        bank_ifsc: '',
        rating: 4,
      });
    }
  }, [selectedVendor, open, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await dispatch(updateVendorAsync({ id: selectedVendor.id, vendorData: data })).unwrap();
        enqueueSnackbar('Vendor updated successfully', { variant: 'success' });
      } else {
        await dispatch(createVendor(data)).unwrap();
        enqueueSnackbar('Vendor added successfully', { variant: 'success' });
      }
      dispatch(setSelectedVendor(null));
      onClose();
    } catch (error) {
      enqueueSnackbar(error || 'Failed to save vendor', { variant: 'error' });
    }
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
                <TextField {...field} label="Vendor Company Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="status" control={control} render={({ field }) => (
                <TextField {...field} select label="Status" fullWidth error={!!errors.status} helperText={errors.status?.message}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="blacklisted">Blacklisted</MenuItem>
                </TextField>
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="contact_person" control={control} render={({ field }) => (
                <TextField {...field} label="Contact Person" fullWidth error={!!errors.contact_person} helperText={errors.contact_person?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="phone" control={control} render={({ field }) => (
                <TextField {...field} label="Phone Number" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Email Address" fullWidth error={!!errors.email} helperText={errors.email?.message} />
              )} />
            </Grid>

            <SectionHeader title="Tax & Identification" />
            <Grid item xs={12} sm={6}>
              <Controller name="gst_number" control={control} render={({ field }) => (
                <TextField {...field} label="GST Number" fullWidth error={!!errors.gst_number} helperText={errors.gst_number?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="pan_number" control={control} render={({ field }) => (
                <TextField {...field} label="PAN Number" fullWidth error={!!errors.pan_number} helperText={errors.pan_number?.message} />
              )} />
            </Grid>

            <SectionHeader title="Banking Details" />
            <Grid item xs={12} sm={4}>
              <Controller name="bank_name" control={control} render={({ field }) => (
                <TextField {...field} label="Bank Name" fullWidth error={!!errors.bank_name} helperText={errors.bank_name?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="bank_account" control={control} render={({ field }) => (
                <TextField {...field} label="Account Number" fullWidth error={!!errors.bank_account} helperText={errors.bank_account?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="bank_ifsc" control={control} render={({ field }) => (
                <TextField {...field} label="IFSC Code" fullWidth error={!!errors.bank_ifsc} helperText={errors.bank_ifsc?.message} />
              )} />
            </Grid>

            <SectionHeader title="Address Details" />
            <Grid item xs={12}>
              <Controller name="address" control={control} render={({ field }) => (
                <TextField {...field} label="Street Address" multiline rows={2} fullWidth error={!!errors.address} helperText={errors.address?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="city" control={control} render={({ field }) => (
                <TextField {...field} label="City" fullWidth error={!!errors.city} helperText={errors.city?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="state" control={control} render={({ field }) => (
                <TextField {...field} label="State" fullWidth error={!!errors.state} helperText={errors.state?.message} />
              )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="pincode" control={control} render={({ field }) => (
                <TextField {...field} label="Pincode" fullWidth error={!!errors.pincode} helperText={errors.pincode?.message} />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha('#fff', 0.1)}` }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#00BFA6', '&:hover': { bgcolor: alpha('#00BFA6', 0.8) } }} disabled={loading}>
            {isEdit ? 'Update Vendor' : 'Add Vendor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VendorFormDialog;
