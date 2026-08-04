import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { ArrowBack, PersonAdd, PersonRemove, Devices } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { mockUsers } from '../../services/mockData';
import { assignAsset, unassignAsset } from './assetsSlice';

const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const asset = useSelector((state) =>
    state.assets.assets.find((a) => String(a.id) === String(id))
  );

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignedUser, setAssignedUser] = useState(mockUsers[0]?.name || '');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Building A, Floor 2');

  if (!asset) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Asset not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/assets')} sx={{ mt: 2 }}>
          Back to Assets
        </Button>
      </Box>
    );
  }

  const handleAssignSubmit = () => {
    dispatch(assignAsset({ id: asset.id, assignedTo: assignedUser, department, location }));
    enqueueSnackbar(`Asset assigned to ${assignedUser}`, { variant: 'success' });
    setAssignDialogOpen(false);
  };

  const handleUnassign = () => {
    if (window.confirm(`Unassign asset from ${asset.assignedTo}?`)) {
      dispatch(unassignAsset(asset.id));
      enqueueSnackbar('Asset unassigned and returned to available inventory', { variant: 'info' });
    }
  };

  const isWarrantyExpired = new Date(asset.warrantyExpiry) < new Date();

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/assets')} sx={{ mb: 2 }}>
        Back to Assets
      </Button>

      <Grid container spacing={3}>
        {/* Main Details */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  {asset.name}
                </Typography>
                <Chip label={asset.status} color={asset.status === 'in-use' ? 'info' : 'success'} />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Asset Code</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.code}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Category / Type</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.type}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.serialNo}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Purchase Cost</Typography>
                  <Typography variant="body1" fontWeight={600} color="primary.main">{formatCurrency(asset.cost)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Purchase Date</Typography>
                  <Typography variant="body1" fontWeight={600}>{formatDate(asset.purchaseDate)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Warranty Expiry</Typography>
                  <Typography variant="body1" fontWeight={600} color={isWarrantyExpired ? 'error.main' : 'success.main'}>
                    {formatDate(asset.warrantyExpiry)} {isWarrantyExpired ? '(Expired)' : '(Valid)'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Supplier Vendor</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.vendor}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Condition</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.condition}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignment Info */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Assignment & Deployment
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {asset.assignedTo ? (
                <Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(0, 191, 166, 0.08)', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Currently Assigned To:</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">{asset.assignedTo}</Typography>
                    <Typography variant="body2" color="text.secondary">Department: {asset.department}</Typography>
                    <Typography variant="body2" color="text.secondary">Location: {asset.location}</Typography>
                  </Box>
                  <Button fullWidth variant="outlined" color="error" startIcon={<PersonRemove />} onClick={handleUnassign}>
                    Unassign & Return to Stock
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    This asset is currently in inventory and available for deployment.
                  </Typography>
                  <Button fullWidth variant="contained" startIcon={<PersonAdd />} onClick={() => setAssignDialogOpen(true)}>
                    Assign to Employee
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Asset</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            fullWidth
            label="Select Employee"
            value={assignedUser}
            onChange={(e) => setAssignedUser(e.target.value)}
            sx={{ mb: 2 }}
          >
            {mockUsers.map((u) => (
              <MenuItem key={u.id} value={u.name}>{u.name} ({u.department})</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Deployment Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignSubmit}>Confirm Assignment</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AssetDetailPage;
