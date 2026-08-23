import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  IconButton,
  Typography,
  Box,
} from "@mui/material";

import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import { addIssue } from "./issueReturnSlice";
import { setAssets } from "../assets/assetsSlice";

import api from "../../services/api";
import dayjs from "dayjs";

const IssueFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { assets = [] } = useSelector((state) => state.assets);

  // =========================================================
  // LOAD ASSETS
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const loadAssets = async () => {
      try {
        const response = await api.get("/assets");

        const rows = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

        const formattedAssets = rows
          .filter((asset) => asset && asset.id)
          .map((asset) => ({
            id: asset.id,
            name: String(asset.asset_name || asset.name || "Unnamed Asset"),
            code: String(asset.asset_code || asset.code || ""),
            type: String(asset.category || asset.type || "Other"),
            serialNo: String(asset.serial_number || asset.serialNo || ""),
            purchaseDate: asset.purchase_date || "",
            warrantyExpiry: asset.warranty_expiry || "",
            cost: Number(asset.purchase_price || asset.cost || 0),
            vendor: asset.vendor || "",
            condition:
              String(asset.status || "").toUpperCase() === "DAMAGED"
                ? "Needs Repair"
                : "Good",
            status: String(asset.status || "").toUpperCase(),
            location: asset.location || "",
          }));

        dispatch(setAssets(formattedAssets));
      } catch (error) {
        console.error("Failed to fetch assets:", error);

        enqueueSnackbar("Failed to load assets.", {
          variant: "error",
        });
      }
    };

    loadAssets();
  }, [open, dispatch, enqueueSnackbar]);

  // =========================================================
  // INITIAL FORM
  // =========================================================

  const getInitialForm = () => ({
    issuedTo: "",
    department: "",
    date: dayjs().format("YYYY-MM-DD"),
    remarks: "",
  });

  const getInitialItems = () => [
    {
      item: null,
      qty: 1,
    },
  ];

  const [formData, setFormData] = useState(getInitialForm());

  const [items, setItems] = useState(getInitialItems());

  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData(getInitialForm());
    setItems(getInitialItems());
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (submitting) return;

    resetForm();
    onClose();
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================================================
  // ADD ITEM
  // =========================================================

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        item: null,
        qty: 1,
      },
    ]);
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const handleRemoveItem = (index) => {
    setItems((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  // =========================================================
  // ITEM CHANGE
  // =========================================================

  const handleItemChange = (index, value) => {
    setItems((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              item: value,
            }
          : row,
      ),
    );
  };

  // =========================================================
  // QUANTITY CHANGE
  // =========================================================

  const handleQuantityChange = (index, value) => {
    setItems((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              qty: value,
            }
          : row,
      ),
    );
  };

  // =========================================================
  // ASSET LABEL
  // =========================================================

  const getAssetLabel = (asset) => {
    if (!asset) return "";

    const name = asset.name || asset.asset_name || "Unnamed Asset";
    const code = asset.code || asset.asset_code || "";

    return code ? `${name} (${code})` : name;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!formData.issuedTo.trim()) {
      enqueueSnackbar("Please enter Issue To.", {
        variant: "error",
      });
      return;
    }

    if (!formData.department.trim()) {
      enqueueSnackbar("Please enter Department.", {
        variant: "error",
      });
      return;
    }

    if (!formData.date) {
      enqueueSnackbar("Please select Date.", {
        variant: "error",
      });
      return;
    }

    if (!items.length) {
      enqueueSnackbar("Please add at least one asset.", {
        variant: "error",
      });
      return;
    }

    const invalidItem = items.find(
      (row) => !row.item || !row.item.id || Number(row.qty) <= 0,
    );

    if (invalidItem) {
      enqueueSnackbar("Please select an asset and enter a valid quantity.", {
        variant: "error",
      });

      return;
    }

    try {
      setSubmitting(true);

      const savedIssues = [];

      // -------------------------------------------------------
      // SAVE EACH ASSET ISSUE
      // -------------------------------------------------------

      for (const row of items) {
        const payload = {
          asset_id: Number(row.item.id),

          // IMPORTANT:
          // This should later come from logged-in user.
          // Keeping 1 for your current project.
          user_id: 1,

          issue_date: `${formData.date} 00:00:00`,

          expected_return_date: null,

          issue_condition: "GOOD",

          notes: JSON.stringify({
            issuedTo: formData.issuedTo.trim(),
            department: formData.department.trim(),
            quantity: Number(row.qty),
            remarks: formData.remarks.trim(),
          }),
        };

        console.log("ISSUE PAYLOAD:", payload);

        const response = await api.post("/issues", payload);

        const saved = response?.data?.data || response?.data;

        savedIssues.push(saved);
      }

      // -------------------------------------------------------
      // CREATE FRONTEND ISSUE RECORD
      // -------------------------------------------------------

      const newIssue = {
        id: savedIssues[0]?.id || Date.now(),

        code:
          savedIssues[0]?.code ||
          `ISS-${dayjs().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,

        date: formData.date,

        issuedTo: formData.issuedTo.trim(),

        department: formData.department.trim(),

        issuedBy: "Rajesh Kumar",

        status: "issued",

        remarks: formData.remarks.trim(),

        items: items.map((row) => ({
          itemId: row.item.id,

          itemName: getAssetLabel(row.item),

          quantity: Number(row.qty),
        })),
      };

      // -------------------------------------------------------
      // REDUX
      // -------------------------------------------------------

      dispatch(addIssue(newIssue));

      // -------------------------------------------------------
      // SUCCESS
      // -------------------------------------------------------

      enqueueSnackbar("Items Issued Successfully", {
        variant: "success",
      });

      resetForm();

      onClose();
    } catch (error) {
      console.error("Issue API Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to issue items.";

      enqueueSnackbar(message, {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // AVAILABLE ASSETS
  // =========================================================

  const availableAssets = assets.filter((asset) => {
    const status = String(asset.status || "").toUpperCase();

    return status !== "ISSUED" && status !== "DAMAGED";
  });

  const hasAssets = availableAssets.length > 0;

  // =========================================================
  // UI
  // =========================================================

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Issue Items</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {/* =================================================
              NO ASSETS
          ================================================= */}

          {!hasAssets && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: "warning.light",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                No asset available to issue.
              </Typography>

              <Typography variant="body2">
                First create an available asset from the Assets section.
              </Typography>
            </Box>
          )}

          {/* =================================================
              BASIC DETAILS
          ================================================= */}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Issue To"
                value={formData.issuedTo}
                onChange={(e) => handleFormChange("issuedTo", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => handleFormChange("department", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Remarks"
                value={formData.remarks}
                onChange={(e) => handleFormChange("remarks", e.target.value)}
              />
            </Grid>
          </Grid>

          {/* =================================================
              ITEMS
          ================================================= */}

          <Typography variant="h6" sx={{ mb: 2 }}>
            Items to Issue
          </Typography>

          {items.map((row, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                alignItems: "flex-start",
              }}
            >
              {/* =================================================
                  ASSET AUTOCOMPLETE
              ================================================= */}

              <Autocomplete
                sx={{ flex: 2 }}
                options={availableAssets}
                value={row.item}
                isOptionEqualToValue={(option, value) =>
                  Number(option?.id) === Number(value?.id)
                }
                getOptionLabel={(option) => getAssetLabel(option)}
                onChange={(event, newValue) => {
                  handleItemChange(index, newValue);
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {String(option.name || "Unnamed Asset")}
                      </Typography>

                      {option.code && (
                        <Typography variant="caption" color="text.secondary">
                          {String(option.code)}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Select Asset" required />
                )}
              />

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <TextField
                sx={{ flex: 1 }}
                type="number"
                label="Quantity"
                value={row.qty}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                inputProps={{
                  min: 1,
                }}
                required
              />

              {/* =================================================
                  DELETE
              ================================================= */}

              <IconButton
                color="error"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length === 1}
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* =================================================
              ADD ANOTHER ITEM
          ================================================= */}

          {hasAssets && (
            <Button
              type="button"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Add Another Item
            </Button>
          )}
        </DialogContent>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <DialogActions>
          <Button type="button" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!hasAssets || submitting}
          >
            {submitting ? "Issuing..." : "Issue"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IssueFormDialog;
