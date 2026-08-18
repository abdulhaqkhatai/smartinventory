import express from "express";
import cors from "cors";
import dotenv from "dotenv";


// ===============================
// Route Imports
// ===============================

import assetRoutes from "./routes/assetRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import indentRoutes from "./routes/indentRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import grnRoutes from "./routes/grnRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";


// ===============================
// Environment Variables
// ===============================

dotenv.config();


// ===============================
// App Initialization
// ===============================

const app = express();

const PORT = process.env.PORT || 5000;


// ===============================
// Middleware
// ===============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ===============================
// Request Logger
// ===============================

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path}`
  );

  next();
});


// ===============================
// API Routes
// ===============================

// Your routes
app.use("/api/assets", assetRoutes);

app.use("/api/issues", issueRoutes);

app.use("/api/returns", returnRoutes);

app.use("/api/reports", reportRoutes);


// Friend's routes
app.use("/api/indents", indentRoutes);

app.use("/api/purchase-orders", purchaseOrderRoutes);

app.use("/api/grn", grnRoutes);

app.use("/api/inventory", inventoryRoutes);


// ===============================
// Root Route
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Inventory Backend is running",
  });
});


// ===============================
// Health Check
// ===============================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Inventory API is working",
    timestamp: new Date(),
  });
});


// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});


// ===============================
// Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
  console.log("=================================");
  console.log("Smart Inventory Backend");
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log("=================================");
});


export default app;