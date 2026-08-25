import React from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { formatDate, getStatusColor, formatCurrency } from '../../utils/helpers';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { updatePOStatus } from './purchaseOrdersSlice';

const PODetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const { purchaseOrders } = useSelector(state => state.purchaseOrders);
  const po = purchaseOrders.find(p => String(p.id) === String(id));

  if (!po) {
    return <Typography>Purchase Order not found</Typography>;
  }

  const handleStatusChange = (newStatus) => {
    dispatch(updatePOStatus({ id: po.id, status: newStatus }))
      .unwrap()
      .then(() => enqueueSnackbar(`Purchase Order ${newStatus}`, { variant: 'success' }))
      .catch((err) => enqueueSnackbar(err || 'Failed to update status', { variant: 'error' }));
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flex: 1 }}>
          Purchase Order: {po.poCode}
        </Typography>
        <Chip 
          label={po.status} 
          color={getStatusColor(po.status)} 
          sx={{ fontWeight: 'bold', px: 2, mr: 2 }}
        />
        {po.status === 'pending' && (
          <>
            <Button variant="contained" color="primary" startIcon={<CheckIcon />} onClick={() => handleStatusChange('confirmed')} sx={{ mr: 1 }}>
              Confirm
            </Button>
            <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => handleStatusChange('cancelled')} sx={{ mr: 1 }}>
              Cancel
            </Button>
          </>
        )}
        {po.status === 'confirmed' && (
          <Button variant="contained" color="success" startIcon={<DoneAllIcon />} onClick={() => handleStatusChange('completed')} sx={{ mr: 1 }}>
            Mark Completed
          </Button>
        )}
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print
        </Button>
      </Box>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary" gutterBottom>Vendor Details</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{po.vendor?.name}</Typography>
              <Typography variant="body2" color="textSecondary">{po.vendor?.contactPerson}</Typography>
              <Typography variant="body2" color="textSecondary">{po.vendor?.phone}</Typography>
              <Typography variant="body2" color="textSecondary">{po.vendor?.email}</Typography>
              <Typography variant="body2" color="textSecondary">{po.vendor?.address}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary" gutterBottom>Order Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">PO Date</Typography>
                  <Typography variant="subtitle2">{formatDate(po.date)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Delivery Date</Typography>
                  <Typography variant="subtitle2">{formatDate(po.deliveryDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Indent Ref</Typography>
                  <Typography variant="subtitle2">{po.indentRef || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="body2">Payment Terms</Typography>
                  <Typography variant="subtitle2">{po.paymentTerms || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Grid>
            {po.terms && (
              <Grid item xs={12}>
                <Typography color="textSecondary" variant="body2">Terms & Conditions</Typography>
                <Typography variant="body2">{po.terms}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Order Items</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item ID</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Rate (₹)</TableCell>
                  <TableCell align="right">GST %</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {po.items && po.items.length > 0 ? (
                  po.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.itemId || item.id || '-'}</TableCell>
                      <TableCell>{item.itemName || item.name || '-'}</TableCell>
                      <TableCell>{item.unit || '-'}</TableCell>
                      <TableCell align="right">{item.quantity || 0}</TableCell>
                      <TableCell align="right">{formatCurrency(item.rate || 0)}</TableCell>
                      <TableCell align="right">{item.gstRate || item.gst || 0}%</TableCell>
                      <TableCell align="right" fontWeight="bold">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">No items found</Typography>
                    </TableCell>
                  </TableRow>
                )}
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
                <Typography align="right" fontWeight="bold">{formatCurrency(po.subTotal || 0)}</Typography>
              </Grid>
              
              {/* Assuming roughly equal split for CGST and SGST for demo purposes */}
              <Grid item xs={6}>
                <Typography align="right" color="textSecondary">CGST:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" fontWeight="bold">{formatCurrency((po.gstAmount || 0) / 2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" color="textSecondary">SGST:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" fontWeight="bold">{formatCurrency((po.gstAmount || 0) / 2)}</Typography>
              </Grid>
              
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={6}>
                <Typography align="right" variant="h6" fontWeight="bold">Grand Total:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right" variant="h6" color="primary" fontWeight="bold">{formatCurrency(po.totalAmount || 0)}</Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PODetailPage;
