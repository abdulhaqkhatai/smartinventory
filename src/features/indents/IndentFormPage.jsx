import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Autocomplete, Divider 
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';
import { addIndent, updateIndent } from './indentsSlice';
import { mockItems } from '../../services/mockData';
import { generateId, formatDate } from '../../utils/helpers';
import api from '../../services/api';
import dayjs from 'dayjs';

const schema = yup.object().shape({
  department: yup.string().required('Department is required'),
  remarks: yup.string(),
  items: yup.array().of(
    yup.object().shape({
      item: yup.object().nullable().required('Item is required'),
      quantity: yup.number().positive('Must be > 0').required('Required'),
      remarks: yup.string()
    })
  ).min(1, 'Add at least one item')
});

const IndentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { indents } = useSelector(state => state.indents);

  const isEdit = Boolean(id);
  const existingIndent = isEdit ? indents.find(i => String(i.id) === String(id)) : null;

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      department: existingIndent?.department || '',
      remarks: existingIndent?.remarks || '',
      items: existingIndent?.items || [{ item: null, quantity: 1, remarks: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const { user } = useSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data, status) => {
    const payload = {
      requestedBy: user?.name || user?.username || 'Current User',
      department: data.department,
      remarks: data.remarks,
      items: data.items.map(i => ({
        itemId: i.item.id || 1, // Fallback to 1 if no id
        itemName: i.item.name,
        code: i.item.code,
        unit: i.item.unit,
        quantity: i.quantity,
        remarks: i.remarks
      })),
      status: status
    };

    try {
      setIsSubmitting(true);
      if (isEdit) {
        const response = await api.put(`/indents/${existingIndent.id}`, payload);
        const updatedIndent = response?.data?.data || response?.data;
        dispatch(updateIndent(updatedIndent));
        enqueueSnackbar('Indent updated successfully', { variant: 'success' });
      } else {
        const response = await api.post('/indents', payload);
        const createdIndent = response?.data?.data || response?.data;
        
        const newIndent = {
          id: createdIndent.id || generateId('IND'),
          indentCode: createdIndent.code || generateId('IND'),
          date: createdIndent.date || new Date().toISOString(),
          requestedBy: createdIndent.requested_by || payload.requestedBy,
          department: createdIndent.department || payload.department,
          remarks: createdIndent.remarks || payload.remarks,
          items: typeof createdIndent.items === 'string' ? JSON.parse(createdIndent.items) : (createdIndent.items || payload.items),
          status: createdIndent.status || status
        };

        dispatch(addIndent(newIndent));
        enqueueSnackbar('Indent created successfully', { variant: 'success' });
      }
      navigate('/indents');
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message || 'Failed to save Indent', { variant: 'error' });
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
          {isEdit ? 'Edit Indent' : 'Create Indent'}
        </Typography>
      </Box>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Department"
                  fullWidth
                  error={!!errors.department}
                  helperText={errors.department?.message}
                />
              )}
            />
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="General Remarks"
                  fullWidth
                  multiline
                />
              )}
            />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Items</Typography>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => append({ item: null, quantity: 1, remarks: '' })}>
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
                  <TableCell>Unit</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell sx={{ minWidth: 250 }}>
                      <Controller
                        name={`items.${index}.item`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Autocomplete
                            options={mockItems}
                            getOptionLabel={(option) => `${option.code} - ${option.name}`}
                            value={value || null}
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
                      {watch(`items.${index}.item`)?.unit || '-'}
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
                        name={`items.${index}.remarks`}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} fullWidth />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          startIcon={<SaveIcon />}
          onClick={handleSubmit((data) => onSubmit(data, 'Draft'))}
        >
          Save as Draft
        </Button>
        <Button 
          variant="contained" 
          startIcon={<SendIcon />}
          onClick={handleSubmit((data) => onSubmit(data, 'Submitted'))}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default IndentFormPage;
