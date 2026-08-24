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
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { addReturn } from "./issueReturnSlice";
import api from "../../services/api";
import { generateId } from "../../utils/helpers";
import dayjs from "dayjs";

// ---------------------------------------------------------
// Helper: Convert objects/arrays into safe React text
// (same guard used in IssueReturnPage.jsx — kept in sync so
// any field coming back from the API as an object instead of
// a string never gets rendered directly as a JSX child)
// ---------------------------------------------------------
const getText = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getText(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.code ||
      value.asset_name ||
      value.employee_name ||
      value.department_name ||
      value.title ||
      value.email ||
      value.id ||
      fallback
    );
  }

  return fallback;
};

const ReturnFormDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { issues } = useSelector((state) => state.issueReturn);
  const [issueOptions, setIssueOptions] = useState([]);
  const sourceIssues = issues.length ? issues : issueOptions;
  const hasIssueOptions = (sourceIssues || []).length > 0;

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
    if (!issues.length) {
      api
        .get("/issues")
        .then((response) => {
          const rows = response?.data?.data || response?.data || [];

          const mapped = rows.map((issue) => {
            // FIX: notes might not be a plain string — run it
            // through getText() before regex-matching on it.
            const notes = getText(issue.notes, "");

            return {
              id: issue.id,
              asset_id: issue.asset_id,
              code: `ISS-${issue.id}`,
              date: issue.issue_date?.split(" ")[0] || issue.issue_date,
              issuedTo:
                notes.match(/Issued To:\s*([^\n,]+)/)?.[1]?.trim() ||
                "Unknown",
              department:
                notes.match(/Department:\s*([^\n,]+)/)?.[1]?.trim() ||
                "General",
              issuedBy: "Rajesh Kumar",
              status: "issued",
              remarks: notes,
              // FIX: this was the actual crash. issue.asset_name can
              // come back as an object (e.g. { id, name, code }) from
              // the API instead of a plain string, and it was being
              // dropped straight into itemName, then rendered directly
              // in a <TableCell> below. getText() guarantees a string.
              items: [
                {
                  itemName: getText(
                    issue.asset_name || issue.asset || issue.asset_details,
                    "Asset"
                  ),
                  quantity: 1,
                },
              ],
            };
          });

          setIssueOptions(mapped);
        })
        .catch((error) => {
          console.error("Failed to fetch issues for return form:", error);
        });
    }
  }, [issues.length]);

  // Auto-select first issue when available
  useEffect(() => {
    if (sourceIssues.length > 0) {
      setFormData((prev) => ({
        ...prev,
        issueRef: getText(sourceIssues[0].code),
        returnedBy: getText(sourceIssues[0].issuedTo),
        department: getText(sourceIssues[0].department),
      }));
      setItems(
        (sourceIssues[0].items || []).map((item) => ({
          itemName: getText(item.itemName, "Asset"),
          issuedQty: item.quantity,
          returnQty: 0,
          condition: "Good",
        })),
      );
    }
  }, [sourceIssues]);

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
      const selectedIssue = sourceIssues.find(
        (issue) => issue.code === formData.issueRef,
      );
      const returnPayload = {
        asset_id: selectedIssue?.asset_id || selectedIssue?.id || 1,
        user_id: user?.id || 1,
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
      const createdReturn = result?.data?.data || result?.data;

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
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to record return.";

      enqueueSnackbar(message, {
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Record Return</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {!hasIssueOptions && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: "warning.light",
                color: "warning.contrastText",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                No issued asset found to return.
              </Typography>
              <Typography variant="body2">
                First create an asset and issue it from the Issue section, then
                return it here.
              </Typography>
            </Box>
          )}

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
                disabled={!hasIssueOptions}
              >
                {(sourceIssues || []).map((iss) => (
                  <MenuItem key={iss.id} value={getText(iss.code)}>
                    {getText(iss.code)} - {getText(iss.issuedTo, "Unknown")}
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
                        <TableCell>{getText(row.itemName, "Asset")}</TableCell>
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