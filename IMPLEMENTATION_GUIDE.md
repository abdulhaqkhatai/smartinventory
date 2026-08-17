# Smart Inventory - Comprehensive Implementation & Integration Guide

## Project Overview
This is a full-stack implementation of the Smart Inventory Store Management System built with React, Redux Toolkit, Material-UI, Node.js/Express, and MySQL.

---

## Core Assigned Modules

### 1. **Authentication (JWT)**
- **Backend**: Login endpoint with JWT token generation and password verification via bcryptjs
- **Frontend**: LoginPage and ProtectedRoute integrated with backend JWT
- **Endpoints**:
  - `POST /api/auth/login` - User login
  - `GET /api/auth/validate` - Token validation
- **Database**: `users` table (id, username, email, password_hash, role, created_at, updated_at)

### 2. **Dashboard**
- **Backend**: Real-time aggregation of metrics across items, vendors, users, and transactions
- **Frontend**: DashboardPage pulling live KPI data from backend API
- **Endpoints**:
  - `GET /api/reports/dashboard` - Dashboard KPI summary
- **KPI Metrics**: Total items, Low stock count, Total/active vendors, Pending indents, Pending GRNs, Assets issued

### 3. **Item Master (CRUD)**
- **Backend**: Full CRUD operations with search and category filtering
- **Frontend**: ItemListPage (DataGrid with search & filter) and ItemFormDialog (react-hook-form + yup validation)
- **Endpoints**:
  - `GET /api/items` - List all items (filters: search, category)
  - `GET /api/items/:id` - Get item by ID
  - `POST /api/items` - Create item
  - `PUT /api/items/:id` - Update item
  - `DELETE /api/items/:id` - Delete item
- **Database**: `items` table with name, category, brand, unit, HSN, GST rate, reorder level, max stock, quantity in stock, unit price

### 4. **Vendor Management (CRUD)**
- **Backend**: Full CRUD operations with search and status filtering
- **Frontend**: VendorListPage and VendorFormDialog
- **Endpoints**:
  - `GET /api/vendors` - List all vendors (filters: search, status)
  - `GET /api/vendors/:id` - Get vendor by ID
  - `POST /api/vendors` - Create vendor
  - `PUT /api/vendors/:id` - Update vendor
  - `DELETE /api/vendors/:id` - Delete vendor
- **Database**: `vendors` table with name, contact person, email, phone, address, GST, PAN, bank details, status, rating

---

## Extended Modules

### 5. **Purchase Indents**
- `GET /api/indents` - Get all indents
- `GET /api/indents/:id` - Get indent by ID
- `POST /api/indents` - Create new indent
- `PUT /api/indents/:id` - Update indent
- `DELETE /api/indents/:id` - Delete indent
- `PATCH /api/indents/:id/status` - Update status (approved/rejected)

### 6. **Purchase Orders**
- `GET /api/purchase-orders` - Get all purchase orders
- `GET /api/purchase-orders/:id` - Get PO by ID
- `POST /api/purchase-orders` - Create PO
- `PUT /api/purchase-orders/:id` - Update PO
- `DELETE /api/purchase-orders/:id` - Delete PO
- `PATCH /api/purchase-orders/:id/status` - Update PO status

### 7. **GRN (Goods Receipt Note)**
- `GET /api/grn` - Get all GRN receipts
- `GET /api/grn/:id` - Get GRN by ID
- `POST /api/grn` - Record new GRN
- `PUT /api/grn/:id` - Update GRN
- `DELETE /api/grn/:id` - Delete GRN

### 8. **Inventory Management**
- `GET /api/inventory` - Get all movements
- `GET /api/inventory/:id` - Get movement by ID
- `GET /api/inventory/stock/levels` - Stock levels summary
- `POST /api/inventory/stock-in` - Record stock in
- `POST /api/inventory/stock-out` - Record stock out
- `POST /api/inventory/transfer` - Record stock transfer
- `POST /api/inventory/adjustment` - Record stock adjustment
- `GET /api/inventory/low-stock` - Get low stock items

---

## Setup & Running Instructions

### Backend Setup
1. Configure `backend/.env`:
   ```env
   DB_HOST=caboose.proxy.rlwy.net
   DB_PORT=47053
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=railway
   PORT=3001
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars_12345
   NODE_ENV=development
   ```

2. Initialize database schema:
   ```bash
   node backend/initDb.js
   ```

3. Start backend server:
   ```bash
   node backend/server.js
   # Server runs on http://localhost:3001
   ```

### Frontend Setup
1. Configure root `.env` (optional, defaults to `http://localhost:3001/api`):
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

2. Start frontend development server:
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

### Test Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

- **Username**: `user1`
- **Password**: `admin123`
- **Role**: `user`
