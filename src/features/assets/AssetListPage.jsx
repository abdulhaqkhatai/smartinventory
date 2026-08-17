import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
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
import { formatCurrency, formatDate } from "../../utils/helpers";
import api from "../../services/api";
import AssetFormDialog from "./AssetFormDialog";
import { deleteAsset, setAssets } from "./assetsSlice";

const AssetListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { assets } = useSelector((state) => state.assets);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await api.get("/assets");
        const rows = response?.data || [];
        dispatch(
          setAssets(
            rows.map((asset) => ({
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
              status:
                String(asset.status).toLowerCase() === "issued"
                  ? "in-use"
                  : "available",
              assignedTo: null,
              department: null,
              location: asset.location || "",
            })),
          ),
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
          <Tooltip title="Edit Asset">
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
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id, params.row.name)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const types = ["All", "Laptop", "Desktop", "Printer", "Monitor", "Furniture"];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
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
          <Typography variant="h4" fontWeight={700}>
            Asset Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register and track corporate IT assets, furniture, warranties, and
            employee assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingAsset(null);
            setFormOpen(true);
          }}
        >
          Register Asset
        </Button>
      </Box>

      {/* Filter Row */}
      <Card sx={{ mb: 3, p: 2 }}>
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
            }}
          />
        </Box>
      </Card>

      {/* DataGrid */}
      <Card sx={{ height: 540 }}>
        <DataGrid
          rows={filteredAssets}
          columns={columns}
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
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
