import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import api from "../../services/api";
import { addAsset, updateAsset } from "./assetsSlice";

const schema = yup.object({
  name: yup.string().required("Asset name is required"),
  type: yup.string().required("Type is required"),
  serialNo: yup.string().required("Serial number is required"),
  purchaseDate: yup.string().required("Purchase date is required"),
  warrantyExpiry: yup.string().required("Warranty expiry is required"),
  cost: yup
    .number()
    .typeError("Cost must be a number")
    .positive("Must be positive")
    .required("Cost is required"),
  vendor: yup.string().required("Vendor is required"),
  location: yup.string().required("Location is required"),
  condition: yup.string().required("Condition is required"),
});

const AssetFormDialog = ({ open, onClose, asset = null }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      type: "Laptop",
      serialNo: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      warrantyExpiry: "",
      cost: 50000,
      vendor: "",
      location: "Building A, Floor 1",
      condition: "Good",
    },
  });

  useEffect(() => {
    if (asset) {
      reset(asset);
    } else {
      reset({
        name: "",
        type: "Laptop",
        serialNo: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        warrantyExpiry: "",
        cost: 50000,
        vendor: "",
        location: "Building A, Floor 1",
        condition: "Good",
      });
    }
  }, [asset, reset, open]);

  const onSubmit = async (data) => {
    const payload = {
      asset_code: asset?.code || `AST-${Date.now()}`,
      asset_name: data.name,
      category: data.type,
      serial_number: data.serialNo,
      purchase_date: data.purchaseDate,
      purchase_price: Number(data.cost),
      location: data.location,
      status: asset && String(asset.status).toUpperCase() === 'ISSUED' 
        ? 'ISSUED' 
        : (data.condition === "Needs Repair" ? "DAMAGED" : "AVAILABLE"),
      description: `${data.vendor || "Vendor not specified"} | ${data.condition}`,
    };

    try {
      if (asset) {
        const response = await api.put(`/assets/${asset.id}`, payload);
        dispatch(
          updateAsset({
            ...asset,
            ...response?.data,
            code: response?.data?.asset_code || asset.code,
            name: response?.data?.asset_name || asset.name,
            type: response?.data?.category || asset.type,
            serialNo: response?.data?.serial_number || asset.serialNo,
            purchaseDate: response?.data?.purchase_date || asset.purchaseDate,
            cost: response?.data?.purchase_price || asset.cost,
            location: response?.data?.location || asset.location,
            status:
              String(response?.data?.status || asset.status).toLowerCase() ===
              "issued"
                ? "in-use"
                : "available",
          }),
        );
        enqueueSnackbar("Asset updated successfully", { variant: "success" });
      } else {
        const response = await api.post("/assets", payload);
        const createdAsset = response?.data || response;
        dispatch(
          addAsset({
            id: createdAsset.id,
            code: createdAsset.asset_code,
            name: createdAsset.asset_name,
            type: createdAsset.category,
            serialNo: createdAsset.serial_number,
            purchaseDate: createdAsset.purchase_date,
            cost: createdAsset.purchase_price,
            location: createdAsset.location,
            status:
              String(createdAsset.status).toLowerCase() === "issued"
                ? "in-use"
                : "available",
            assignedTo: null,
            department: null,
            vendor: data.vendor || "",
            condition:
              createdAsset.status === "DAMAGED" ? "Needs Repair" : "Good",
          }),
        );
        enqueueSnackbar("Asset registered successfully", {
          variant: "success",
        });
      }
      onClose();
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to save asset", {
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{asset ? "Edit Asset" : "Register New Asset"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Asset Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Asset Category / Type"
                  >
                    <MenuItem value="Laptop">Laptop</MenuItem>
                    <MenuItem value="Desktop">Desktop</MenuItem>
                    <MenuItem value="Printer">Printer</MenuItem>
                    <MenuItem value="Monitor">Monitor</MenuItem>
                    <MenuItem value="Furniture">Furniture</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="serialNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Serial Number / Tag"
                    error={!!errors.serialNo}
                    helperText={errors.serialNo?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="cost"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Purchase Cost (INR)"
                    error={!!errors.cost}
                    helperText={errors.cost?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="purchaseDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Purchase Date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="warrantyExpiry"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Warranty Expiry Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.warrantyExpiry}
                    helperText={errors.warrantyExpiry?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="vendor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Supplier / Vendor"
                    placeholder="Vendor name"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Initial Condition"
                  >
                    <MenuItem value="Good">Good</MenuItem>
                    <MenuItem value="Fair">Fair</MenuItem>
                    <MenuItem value="Needs Repair">Needs Repair</MenuItem>
                    <MenuItem value="Non-functional">Non-functional</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Storage / Deployment Location"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {asset ? "Save Changes" : "Register Asset"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssetFormDialog;
