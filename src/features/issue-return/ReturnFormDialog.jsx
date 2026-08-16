import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { addReturn } from "./issueReturnSlice";
import api from "../../services/api";
import { generateId } from "../../utils/helpers";
import dayjs from "dayjs";

const ReturnFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { issues } = useSelector((state) => state.issueReturn);

  const initialForm = {
    issueRef: "",
    returnedBy: "",
    department: "",
    date: dayjs().format("YYYY-MM-DD"),
    remarks: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (formData.issueRef) {
      const issue = issues.find((i) => i.code === formData.issueRef);
      if (issue) {
        setFormData((prev) => ({
          ...prev,
          returnedBy: issue.issuedTo,
          department: issue.department,
        }));
        setItems(
          issue.items.map((item) => ({
            itemName: item.itemName,
            issuedQty: item.quantity,
            returnQty: 0,
            condition: "Good",
          })),
        );
      }
    } else {
      setItems([]);
    }
  }, [formData.issueRef, issues]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "returnQty") {
      newItems[index][field] = Math.min(
        Number(value) || 0,
        newItems[index].issuedQty,
      );
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const returningItems = items.filter((i) => i.returnQty > 0);
    if (returningItems.length === 0) {
      enqueueSnackbar("Please specify at least one item to return.", {
        variant: "error",
      });
      return;
    }

    try {
      const selectedIssue = issues.find(
        (issue) => issue.code === formData.issueRef,
      );
      const returnPayload = {
        asset_id: selectedIssue?.asset_id || selectedIssue?.id || 1,
        user_id: 1,
        return_date: `${formData.date} 00:00:00`,
        return_condition: returningItems.some(
          (item) =>
            item.condition === "Damaged" || item.condition === "Needs Repair",
        )
          ? "DAMAGED"
          : "GOOD",
        damage_description:
          returningItems
            .filter((item) => item.condition !== "Good")
            .map((item) => `${item.itemName}: ${item.condition}`)
            .join("; ") || null,
        notes: `${formData.remarks || "Return recorded"}\nIssue Ref: ${formData.issueRef}`,
      };

      const result = await api.post("/returns", returnPayload);
      const createdReturn = result?.data || result;

      const newReturn = {
        id: createdReturn?.id || generateId(),
        code: `RTN-${dayjs().format("YYYY")}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        date: formData.date,
        returnedBy: formData.returnedBy,
        department: formData.department,
        receivedBy: "Rajesh Kumar",
        issueRef: formData.issueRef,
        remarks: formData.remarks,
        items: returningItems.map((i) => ({
          itemName: i.itemName,
          quantity: i.returnQty,
          condition: i.condition,
        })),
      };

      dispatch(addReturn(newReturn));
      enqueueSnackbar("Items Returned Successfully", { variant: "success" });
      setFormData(initialForm);
      setItems([]);
      onClose();
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to record return.", {
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Record Return</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Issue Reference"
                value={formData.issueRef}
                onChange={(e) =>
                  setFormData({ ...formData, issueRef: e.target.value })
                }
                required
              >
                {issues.map((iss) => (
                  <MenuItem key={iss.id} value={iss.code}>
                    {iss.code} - {iss.issuedTo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Returned By"
                value={formData.returnedBy}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </Grid>
          </Grid>

          {items.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Name</TableCell>
                      <TableCell align="center">Issued Qty</TableCell>
                      <TableCell align="center">Return Qty</TableCell>
                      <TableCell>Condition</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.itemName}</TableCell>
                        <TableCell align="center">{row.issuedQty}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={row.returnQty}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "returnQty",
                                e.target.value,
                              )
                            }
                            inputProps={{ min: 0, max: row.issuedQty }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={row.condition}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "condition",
                                e.target.value,
                              )
                            }
                            sx={{ width: 120 }}
                          >
                            <MenuItem value="Good">Good</MenuItem>
                            <MenuItem value="Damaged">Damaged</MenuItem>
                            <MenuItem value="Needs Repair">
                              Needs Repair
                            </MenuItem>
                          </TextField>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={items.length === 0}
          >
            Record Return
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReturnFormDialog;
