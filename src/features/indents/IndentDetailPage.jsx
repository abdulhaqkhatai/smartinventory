import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { updateIndentStatus } from './indentsSlice';
import { useSnackbar } from 'notistack';

const IndentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const { indents } = useSelector(state => state.indents);
  const indent = indents.find(i => i.id === id);
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!indent) {
    return <Typography>Indent not found</Typography>;
  }

  const handleApprove = () => {
    dispatch(updateIndentStatus({ id, status: 'Approved', approvedBy: 'Manager User' }));
    enqueueSnackbar('Indent Approved', { variant: 'success' });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      enqueueSnackbar('Please provide a reason for rejection', { variant: 'error' });
      return;
    }
    dispatch(updateIndentStatus({ id, status: 'Rejected', rejectionReason: rejectReason }));
    setRejectDialogOpen(false);
    enqueueSnackbar('Indent Rejected', { variant: 'warning' });
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flex: 1 }}>
          Indent Details: {indent.indentCode}
        </Typography>
        <Chip 
          label={indent.status} 
          color={getStatusColor(indent.status)} 
          sx={{ fontWeight: 'bold', px: 2 }}
        />
      </Box>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="textSecondary" variant="body2">Requested By</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{indent.requestedBy}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="textSecondary" variant="body2">Department</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{indent.department}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="textSecondary" variant="body2">Date</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatDate(indent.date)}</Typography>
            </Grid>
            {indent.approvedBy && (
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="textSecondary" variant="body2">Approved By</Typography>
                <Typography variant="subtitle1" fontWeight="bold">{indent.approvedBy}</Typography>
              </Grid>
            )}
            {indent.remarks && (
              <Grid item xs={12}>
                <Typography color="textSecondary" variant="body2">Remarks</Typography>
                <Typography variant="subtitle1">{indent.remarks}</Typography>
              </Grid>
            )}
             {indent.rejectionReason && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2">Rejection Reason</Typography>
                <Typography variant="subtitle1" color="error">{indent.rejectionReason}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Requested Items</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Code</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {indent.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell>{item.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {indent.status === 'Submitted' && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<CloseIcon />}
            onClick={() => setRejectDialogOpen(true)}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<CheckIcon />}
            onClick={handleApprove}
          >
            Approve
          </Button>
        </Box>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Indent</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" variant="contained">Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndentDetailPage;
