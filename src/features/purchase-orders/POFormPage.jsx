import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Button, TextField, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Autocomplete, Grid, Divider
} from '@mui/material';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import { addPurchaseOrder } from './purchaseOrdersSlice';
import { fetchIndents } from '../indents/indentsSlice';
import { mockVendors, mockIndents, mockItems } from '../../services/mockData';
import { generateId, formatDate, formatCurrency } from '../../utils/helpers';
import api from '../../services/api';

const schema = yup.object().shape({
  vendor: yup.object().nullable().required('Vendor is required'),
  indentRef: yup.object().nullable(),
  deliveryDate: yup.string().required('Delivery date is required'),
  terms: yup.string(),
  paymentTerms: yup.string(),
  items: yup.array().of(
    yup.object().shape({
      item: yup.object().nullable().required('Item is required'),
      quantity: yup.number().positive('Must be > 0').required('Required'),
      rate: yup.number().positive('Must be > 0').required('Required'),
      gst: yup.number().min(0).required('Required')
    })
  ).min(1, 'Add at least one item')
});

const POFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { indents } = useSelector(state => state.indents);

  useEffect(() => {
    dispatch(fetchIndents());
  }, [dispatch]);

  const approvedIndents = indents.filter(i => String(i.status).toLowerCase() === 'approved');

  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vendor: null,
      indentRef: null,
      deliveryDate: '',
      terms: '',
      paymentTerms: '',
      items: [{ item: null, quantity: 1, rate: 0, gst: 18 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = useWatch({ control, name: 'items' });

  const totals = useMemo(() => {
    return watchItems.reduce((acc, curr) => {
      const qty = parseFloat(curr.quantity) || 0;
      const rate = parseFloat(curr.rate) || 0;
      const gstPercent = parseFloat(curr.gst) || 0;
      
      const amount = qty * rate;
      const gstAmount = amount * (gstPercent / 100);
      
      acc.subTotal += amount;
      acc.gstAmount += gstAmount;
      acc.grandTotal += (amount + gstAmount);
      return acc;
    }, { subTotal: 0, gstAmount: 0, grandTotal: 0 });
  }, [watchItems]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    const payload = {
      vendorId: data.vendor?.id || 1, // Fallback if no vendor id
      vendorName: data.vendor?.name || '',
      indentRef: data.indentRef?.indentCode || '',
      items: data.items.map(i => {
        const qty = parseFloat(i.quantity);
        const rate = parseFloat(i.rate);
        const gst = parseFloat(i.gst);
        return {
          itemId: i.item.id || 1, // Fallback if no id
          itemName: i.item.name,
          quantity: qty,
          rate: rate,
          gstRate: gst
        };
      }),
      deliveryDate: data.deliveryDate,
      terms: data.terms,
      paymentTerms: data.paymentTerms
    };

    try {
      setIsSubmitting(true);
      const response = await api.post('/purchase-orders', payload);
      const createdPO = response?.data?.data || response?.data;

      const newPO = {
        id: createdPO.id || generateId('PO'),
        poCode: createdPO.code || generateId('PO'),
        date: createdPO.date || new Date().toISOString(),
        vendor: data.vendor,
        indentRef: createdPO.indent_ref || payload.indentRef,
        deliveryDate: createdPO.delivery_date || payload.deliveryDate,
        terms: createdPO.terms || payload.terms,
        paymentTerms: createdPO.payment_terms || payload.paymentTerms,
        status: createdPO.status || 'pending',
        items: data.items.map(i => {
          const qty = parseFloat(i.quantity);
          const rate = parseFloat(i.rate);
          const gst = parseFloat(i.gst);
          const amount = qty * rate;
          return {
            id: i.item.id,
            name: i.item.name,
            code: i.item.code,
            unit: i.item.unit,
            quantity: qty,
            rate: rate,
            gst: gst,
            amount: amount
          };
        }),
        subTotal: totals.subTotal,
        gstAmount: totals.gstAmount,
        totalAmount: totals.grandTotal
      };

      dispatch(addPurchaseOrder(newPO));
      enqueueSnackbar('Purchase Order created successfully', { variant: 'success' });
      navigate('/purchase-orders');
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message || 'Failed to create PO', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Create Purchase Order
        </Typography>
      </Box>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="vendor"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={mockVendors}
                    getOptionLabel={(option) => option.name}
                    value={value}
                    onChange={(_, data) => onChange(data)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Vendor *" 
                        error={!!errors.vendor}
                        helperText={errors.vendor?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="indentRef"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={approvedIndents}
                    getOptionLabel={(option) => `${option.indentCode} - ${option.department}`}
                    value={value}
                    onChange={(_, data) => onChange(data)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Indent Reference (Optional)" 
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="deliveryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Delivery Date *"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.deliveryDate}
                    helperText={errors.deliveryDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="paymentTerms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Payment Terms"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="General Terms & Conditions"
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Items</Typography>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => append({ item: null, quantity: 1, rate: 0, gst: 18 })}>
              Add Item
            </Button>
          </Box>
          
          {errors.items?.message && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>{errors.items.message}</Typography>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Rate (₹)</TableCell>
                  <TableCell>GST %</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => {
                  const qty = watchItems[index]?.quantity || 0;
                  const rate = watchItems[index]?.rate || 0;
                  const amount = qty * rate;

                  return (
                    <TableRow key={field.id}>
                      <TableCell sx={{ minWidth: 250 }}>
                        <Controller
                          name={`items.${index}.item`}
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Autocomplete
                              options={mockItems}
                              getOptionLabel={(option) => `${option.code} - ${option.name}`}
                              value={value}
                              onChange={(_, data) => onChange(data)}
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  error={!!errors.items?.[index]?.item}
                                  helperText={errors.items?.[index]?.item?.message}
                                />
                              )}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              error={!!errors.items?.[index]?.quantity}
                              helperText={errors.items?.[index]?.quantity?.message}
                              sx={{ width: 100 }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`items.${index}.rate`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              error={!!errors.items?.[index]?.rate}
                              helperText={errors.items?.[index]?.rate?.message}
                              sx={{ width: 120 }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`items.${index}.gst`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              error={!!errors.items?.[index]?.gst}
                              helperText={errors.items?.[index]?.gst?.message}
                              sx={{ width: 100 }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(amount)}
                      </TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Grid container spacing={2} sx={{ maxWidth: 400 }}>
              <Grid item xs={6}>
                <Typography align="right" color="textSecondary">Subtotal:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" fontWeight="bold">{formatCurrency(totals.subTotal)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" color="textSecondary">GST Amount:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" fontWeight="bold">{formatCurrency(totals.gstAmount)}</Typography>
              </Grid>
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={6}>
                <Typography align="right" variant="h6" fontWeight="bold">Grand Total:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" variant="h6" color="primary" fontWeight="bold">{formatCurrency(totals.grandTotal)}</Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSubmit(onSubmit)}
          size="large"
        >
          Create Purchase Order
        </Button>
      </Box>
    </Box>
  );
};

export default POFormPage;
