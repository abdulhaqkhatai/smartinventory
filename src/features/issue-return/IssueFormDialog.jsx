import React, { useState } from "react";

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

import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";

import { addIssue } from "./issueReturnSlice";
import api from "../../services/api";

import dayjs from "dayjs";

import { mockItems } from "../../services/mockData";

const IssueFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  // ==========================================
  // INITIAL FORM
  // ==========================================

  const initialForm = {
    issuedTo: "",
    department: "",
    date: dayjs().format("YYYY-MM-DD"),
    remarks: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const [items, setItems] = useState([
    {
      item: null,
      qty: 1,
    },
  ]);

  // ==========================================
  // ADD ITEM
  // ==========================================

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item: null,
        qty: 1,
      },
    ]);
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // ==========================================
  // ITEM CHANGE
  // ==========================================

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];

    newItems[index][field] = value;

    setItems(newItems);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!formData.issuedTo || !formData.department) {
      enqueueSnackbar("Please fill all required fields.", {
        variant: "error",
      });

      return;
    }

    if (items.some((item) => !item.item || Number(item.qty) <= 0)) {
      enqueueSnackbar("Please select items and valid quantities.", {
        variant: "error",
      });

      return;
    }

    try {
      // --------------------------------------
      // SEND EACH ITEM TO BACKEND
      // --------------------------------------

      const savedIssues = [];

      for (const row of items) {
        const result = await api.post("/issues", {
          asset_id: row.item.id,
          user_id: 1,
          issue_date: `${formData.date} 00:00:00`,
          expected_return_date: null,
          issue_condition: "GOOD",
          notes: `Issued To: ${formData.issuedTo}\nDepartment: ${formData.department}\nQuantity: ${Number(row.qty)}\nRemarks: ${formData.remarks}`,
        });

        savedIssues.push(result?.data || result);
      }

      // --------------------------------------
      // UPDATE REDUX
      // --------------------------------------

      const newIssue = {
        id: savedIssues[0]?.id || Date.now(),

        code: `ISS-${dayjs().format("YYYY")}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,

        date: formData.date,

        issuedTo: formData.issuedTo,

        department: formData.department,

        issuedBy: "Rajesh Kumar",

        status: "issued",

        remarks: formData.remarks,

        items: items.map((i) => ({
          itemName: i.item.name,

          quantity: Number(i.qty),
        })),
      };

      dispatch(addIssue(newIssue));

      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      enqueueSnackbar("Items Issued Successfully", {
        variant: "success",
      });

      // --------------------------------------
      // RESET
      // --------------------------------------

      setFormData(initialForm);

      setItems([
        {
          item: null,
          qty: 1,
        },
      ]);

      onClose();
    } catch (error) {
      console.error("Issue API Error:", error);

      enqueueSnackbar(error.message || "Failed to issue items", {
        variant: "error",
      });
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: "bold",
        }}
      >
        Issue Items
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
            }}
          >
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Issue To"
                value={formData.issuedTo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    issuedTo: e.target.value,
                  })
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value,
                  })
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    remarks: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            sx={{
              mb: 2,
            }}
          >
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
              <Autocomplete
                sx={{
                  flex: 2,
                }}
                options={mockItems}
                getOptionLabel={(option) => option.name}
                value={row.item}
                onChange={(e, newValue) =>
                  handleItemChange(index, "item", newValue)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Select Item" required />
                )}
              />

              <TextField
                sx={{
                  flex: 1,
                }}
                type="number"
                label="Quantity"
                value={row.qty}
                onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                inputProps={{
                  min: 1,
                }}
                required
              />

              <IconButton
                color="error"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length === 1}
                sx={{
                  mt: 1,
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button startIcon={<AddIcon />} onClick={handleAddItem}>
            Add Another Item
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>

          <Button type="submit" variant="contained" color="primary">
            Issue
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IssueFormDialog;
