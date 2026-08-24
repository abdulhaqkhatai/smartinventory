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
import { ArrowBack, PersonAdd, PersonRemove } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { mockUsers } from '../../services/mockData';
import { assignAsset, unassignAsset, updateAsset, addAsset } from './assetsSlice';
import api from '../../services/api';

const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const asset = useSelector((state) =>
    state.assets.assets.find((a) => String(a.id) === String(id))
  );
  const { user } = useSelector((state) => state.auth);
  const canAssign = user?.role === 'Admin' || user?.role === 'Store Manager';

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignedUser, setAssignedUser] = useState(mockUsers[0]?.name || '');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Building A, Floor 2');
  const [loading, setLoading] = useState(!asset);

  React.useEffect(() => {
    if (!asset) {
      Promise.all([
        api.get(`/assets/${id}`),
        api.get(`/issues`).catch(() => ({ data: [] }))
      ])
        .then(([assetResponse, issuesResponse]) => {
          const fetchedAsset = assetResponse?.data?.data || assetResponse?.data;
          const rawIssues = Array.isArray(issuesResponse?.data) ? issuesResponse.data : (issuesResponse?.data?.data || []);
          
          if (fetchedAsset) {
            const isIssued = String(fetchedAsset.status).toLowerCase() === "issued";
            let assignedTo = null;
            let fetchedDepartment = null;

            if (isIssued) {
              const latestIssues = rawIssues.filter(i => 
                (i.asset_id || i.asset?.id || i.asset_details?.id) === fetchedAsset.id
              );
              if (latestIssues.length > 0) {
                const issue = latestIssues[latestIssues.length - 1]; // Assuming order or just taking last
                const notes = typeof issue.notes === 'string' ? issue.notes : JSON.stringify(issue.notes || {});
                
                assignedTo = issue.issuedTo || issue.issued_to || issue.employee || issue.employee_name || issue.user || "";
                if (!assignedTo) {
                    const match = notes.match(/Issued To\s*:\s*([^\n,]+)/i);
                    if (match) assignedTo = match[1].trim();
                }
                if (!assignedTo) {
                   try {
                      const parsed = JSON.parse(notes);
                      assignedTo = parsed.issuedTo;
                   } catch(e) {}
                }

                fetchedDepartment = issue.department || issue.department_name || "";
                if (!fetchedDepartment) {
                   try {
                      const parsed = JSON.parse(notes);
                      fetchedDepartment = parsed.department;
                   } catch(e) {}
                }
              }
            }

            dispatch(addAsset({
              id: fetchedAsset.id,
              code: fetchedAsset.asset_code,
              name: fetchedAsset.asset_name,
              type: fetchedAsset.category || "Other",
              serialNo: fetchedAsset.serial_number || "",
              purchaseDate: fetchedAsset.purchase_date || "",
              warrantyExpiry: fetchedAsset.warranty_expiry || "",
              cost: fetchedAsset.purchase_price || 0,
              vendor: fetchedAsset.vendor || "",
              condition: fetchedAsset.status === "DAMAGED" ? "Needs Repair" : "Good",
              status: isIssued ? "in-use" : "available",
              assignedTo: assignedTo || null,
              department: fetchedDepartment || null,
              location: fetchedAsset.location || "",
            }));
          }
        })
        .catch(err => {
          console.error("Failed to fetch asset", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [asset, id, dispatch]);

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading...</Typography></Box>;
  }

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

  const handleAssignSubmit = async () => {
    try {
      await api.put(`/assets/${asset.id}`, {
        status: 'ISSUED',
        location: location
      });
      
      await api.post('/issues', {
        asset_id: asset.id,
        user_id: 1,
        issue_date: new Date().toISOString().split('T')[0] + ' 00:00:00',
        issue_condition: 'Good',
        notes: JSON.stringify({
          issuedTo: assignedUser,
          department: department,
          remarks: "Assigned from Asset Details Page"
        })
      });

      dispatch(assignAsset({ id: asset.id, assignedTo: assignedUser, department, location }));
      enqueueSnackbar(`Asset assigned to ${assignedUser}`, { variant: 'success' });
      setAssignDialogOpen(false);
    } catch (error) {
      enqueueSnackbar(error?.message || 'Failed to assign asset', { variant: 'error' });
    }
  };

  const handleUnassign = async () => {
    if (window.confirm(`Unassign asset from ${asset.assignedTo}?`)) {
      try {
        await api.put(`/assets/${asset.id}`, {
          status: 'AVAILABLE'
        });

        await api.post('/returns', {
          asset_id: asset.id,
          user_id: 1,
          return_date: new Date().toISOString().split('T')[0] + ' 00:00:00',
          return_condition: 'Good',
          notes: JSON.stringify({
            returnedBy: asset.assignedTo,
            department: asset.department,
            remarks: "Unassigned from Asset Details Page"
          })
        });

        dispatch(unassignAsset(asset.id));
        enqueueSnackbar('Asset unassigned and returned to available inventory', { variant: 'info' });
      } catch (error) {
        enqueueSnackbar(error?.message || 'Failed to unassign asset', { variant: 'error' });
      }
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
          <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight={800} sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {asset.name}
                </Typography>
                <Chip label={asset.status} color={asset.status === 'in-use' ? 'info' : 'success'} sx={{ fontWeight: 600, borderRadius: 2 }} />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Asset Code</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.code}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Category / Type</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.type}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Serial Number</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.serialNo}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Purchase Cost</Typography>
                  <Typography variant="body1" fontWeight={700} color="primary.main">{formatCurrency(asset.cost)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Purchase Date</Typography>
                  <Typography variant="body1" fontWeight={600}>{formatDate(asset.purchaseDate)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Warranty Expiry</Typography>
                  <Typography variant="body1" fontWeight={600} color={isWarrantyExpired ? 'error.main' : 'success.main'}>
                    {formatDate(asset.warrantyExpiry)} {isWarrantyExpired ? '(Expired)' : '(Valid)'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Supplier Vendor</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.vendor}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Condition</Typography>
                  <Typography variant="body1" fontWeight={600}>{asset.condition}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignment Info */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)' }}>
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
                  {canAssign && (
                    <Button fullWidth variant="outlined" color="error" startIcon={<PersonRemove />} onClick={handleUnassign}>
                      Unassign & Return to Stock
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    This asset is currently in inventory and available for deployment.
                  </Typography>
                  {canAssign && (
                    <Button fullWidth variant="contained" startIcon={<PersonAdd />} onClick={() => setAssignDialogOpen(true)}>
                      Assign to Employee
                    </Button>
                  )}
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
