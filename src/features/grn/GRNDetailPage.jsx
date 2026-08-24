import React from 'react';
import { Box, Typography, Button, Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';
import { formatDate, getStatusColor } from '../../utils/helpers';

const GRNDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { grns } = useSelector(state => state.grn);
  
  const grn = grns.find(g => String(g.id) === String(id));

  if (!grn) {
    return <Typography sx={{ p: 3 }}>GRN not found.</Typography>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/grn')}>Back</Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{grn.code}</Typography>
              <Typography variant="subtitle1" color="text.secondary">Goods Receipt Note</Typography>
            </Box>
            <Chip 
              label={grn.status.toUpperCase()} 
              color={getStatusColor(grn.status)}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Vendor</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{grn.vendorName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">PO Reference</Typography>
              <Typography variant="body1">{grn.poRef}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Date</Typography>
              <Typography variant="body1">{formatDate(grn.date)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Received By</Typography>
              <Typography variant="body1">{grn.receivedBy}</Typography>
            </Grid>
            {grn.remarks && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                <Typography variant="body1">{grn.remarks}</Typography>
              </Grid>
            )}
          </Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>Received Items</Typography>
          <TableContainer variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Ordered</TableCell>
                  <TableCell align="right">Received</TableCell>
                  <TableCell align="right">Damaged</TableCell>
                  <TableCell align="right">Accepted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grn.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell align="right">{item.orderedQty}</TableCell>
                    <TableCell align="right">{item.receivedQty}</TableCell>
                    <TableCell align="right" sx={{ color: item.damagedQty > 0 ? 'error.main' : 'inherit' }}>
                      {item.damagedQty}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {item.acceptedQty}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </Paper>
      </Box>
    </motion.div>
  );
};

export default GRNDetailPage;
