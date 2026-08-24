import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Search, Edit, Delete, Visibility } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { formatCurrency } from "../../utils/helpers";
import api from "../../services/api";
import AssetFormDialog from "./AssetFormDialog";
import { deleteAsset, setAssets } from "./assetsSlice";

const AssetListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { assets } = useSelector((state) => state.assets);
  const { user } = useSelector((state) => state.auth);

  const userRole = (user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isStoreManager = userRole === 'store_manager' || userRole === 'store manager';
  const isEmployee = userRole === 'employee';
  const isPurchaseManager = userRole === 'purchase_manager' || userRole === 'purchase manager';
  const canAddEdit = isAdmin || isStoreManager;
  const canDelete = isAdmin;

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const [assetsResponse, issuesResponse] = await Promise.all([
          api.get("/assets"),
          api.get("/issues").catch(() => ({ data: [] }))
        ]);
        
        const rawAssets = assetsResponse?.data || [];
        const rawIssues = Array.isArray(issuesResponse.data) ? issuesResponse.data : (issuesResponse.data?.data || []);
        
        const latestIssues = {};
        rawIssues.forEach(issue => {
          const assetId = issue.asset_id || issue.asset?.id || issue.asset_details?.id;
          if (assetId) {
             latestIssues[assetId] = issue;
          }
        });

        dispatch(
          setAssets(
            rawAssets.map((asset) => {
               const isIssued = String(asset.status).toLowerCase() === "issued";
               let assignedTo = null;
               let department = null;
               
               if (isIssued && latestIssues[asset.id]) {
                  const issue = latestIssues[asset.id];
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
                     } catch {}
                  }

                  department = issue.department || issue.department_name || "";
                  if (!department) {
                     try {
                        const parsed = JSON.parse(notes);
                        department = parsed.department;
                     } catch {}
                  }
               }

               return {
                  id: asset.id,
                  code: asset.asset_code,
                  name: asset.asset_name,
                  type: asset.category || "Other",
                  serialNo: asset.serial_number || "",
                  purchaseDate: asset.purchase_date || "",
                  warrantyExpiry: asset.warranty_expiry || "",
                  cost: asset.purchase_price || 0,
                  vendor: asset.vendor || "",
                  condition: asset.status === "DAMAGED" ? "Needs Repair" : "Good",
                  status: isIssued ? "in-use" : "available",
                  assignedTo: assignedTo || null,
                  department: department || null,
                  location: asset.location || "",
               };
            })
          )
        );
      } catch (error) {
        console.error("Failed to fetch assets:", error);
      }
    };

    loadAssets();
  }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete asset "${name}"?`)) {
      try {
        await api.delete(`/assets/${id}`);
        dispatch(deleteAsset(id));
        enqueueSnackbar("Asset deleted", { variant: "info" });
      } catch (error) {
        enqueueSnackbar(error?.message || "Failed to delete asset", {
          variant: "error",
        });
      }
    }
  };

  const columns = [
    {
      field: "code",
      headerName: "Asset Code",
      width: 120,
      renderCell: (params) => (
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    { field: "name", headerName: "Asset Name", flex: 1, minWidth: 180 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "serialNo", headerName: "Serial No", width: 140 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const map = {
          "in-use": "info",
          available: "success",
          "in-maintenance": "warning",
          retired: "default",
        };
        return (
          <Chip
            label={params.value}
            color={map[params.value] || "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      width: 150,
      valueFormatter: (value) => value || "Unassigned",
    },
    {
      field: "department",
      headerName: "Department",
      width: 130,
      valueFormatter: (value) => value || "-",
    },
    {
      field: "cost",
      headerName: "Cost",
      width: 120,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/assets/${params.row.id}`)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {canAddEdit && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setEditingAsset(params.row);
                  setFormOpen(true);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(params.row.id, params.row.name)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const types = ["All", "Laptop", "Desktop", "Printer", "Monitor", "Furniture"];

  const filteredAssets = assets.filter((asset) => {
    // Role based filtering
    if (isEmployee && asset.assignedTo !== user?.name) {
      return false;
    }
    if (isStoreManager && asset.location !== user?.location && asset.location !== (user?.location || 'General')) {
      // Allow if asset location matches user location, or both are blank/General
      const userLoc = (user?.location || 'General').toLowerCase();
      const assetLoc = (asset.location || 'General').toLowerCase();
      if (userLoc !== assetLoc) return false;
    }

    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Asset Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register and track corporate IT assets, furniture, warranties, and
            employee assignments
          </Typography>
        </Box>
        {canAddEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingAsset(null);
              setFormOpen(true);
            }}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
              }
            }}
          >
            Register Asset
          </Button>
        )}
      </Box>

      {/* Filter Row */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {types.map((t) => (
              <Chip
                key={t}
                label={t}
                clickable
                color={typeFilter === t ? "primary" : "default"}
                onClick={() => setTypeFilter(t)}
                sx={{ borderRadius: 2, fontWeight: 500 }}
              />
            ))}
          </Box>
          <TextField
            size="small"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, backgroundColor: 'background.default' }
            }}
          />
        </Box>
      </Card>

      {/* DataGrid */}
      <Card sx={{ height: 540, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <DataGrid
          rows={filteredAssets}
          columns={columns}
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.default',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px dashed',
              borderColor: 'divider',
            }
          }}
        />
      </Card>

      <AssetFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        asset={editingAsset}
      />
    </motion.div>
  );
};

export default AssetListPage;
