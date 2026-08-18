# Implementation Guide for Abdul haq (Intern 2)

## Your Assigned Modules
1. **Purchase Indent** - Request items from departments
2. **Purchase Order** - Create PO from approved indents
3. **GRN (Goods Receipt Note)** - Receive and verify goods
4. **Inventory** - Track stock movements and levels

---

## Backend Infrastructure Setup

### 1. Database Tables Required
Add these tables to your MySQL database (schema.sql):

```sql
-- Indents table
CREATE TABLE indents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    requested_by VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    items JSON NOT NULL,
    remarks VARCHAR(500),
    approved_by VARCHAR(150),
    approval_date DATE,
    rejection_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Purchase Orders table
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    vendor_id INT NOT NULL,
    vendor_name VARCHAR(150) NOT NULL,
    indent_ref VARCHAR(50),
    date DATE NOT NULL,
    delivery_date DATE,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    items JSON NOT NULL,
    subtotal DECIMAL(12,2),
    gst_amount DECIMAL(12,2),
    total_amount DECIMAL(12,2),
    terms VARCHAR(500),
    payment_terms VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- GRN (Goods Receipt Note) table
CREATE TABLE grns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    po_ref VARCHAR(50) NOT NULL,
    vendor_name VARCHAR(150),
    date DATE NOT NULL,
    received_by VARCHAR(150) NOT NULL,
    status ENUM('completed', 'partial') DEFAULT 'completed',
    items JSON NOT NULL,
    remarks VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock Movements table
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50),
    quantity INT,
    reference VARCHAR(100),
    warehouse VARCHAR(100),
    performed_by VARCHAR(150),
    remarks VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Add these columns to items table if they don't exist:
ALTER TABLE items ADD COLUMN current_stock INT DEFAULT 0;
ALTER TABLE items ADD COLUMN min_stock INT DEFAULT 0;
ALTER TABLE items ADD COLUMN max_stock INT DEFAULT 0;
ALTER TABLE items ADD COLUMN reorder_level INT DEFAULT 0;
```

### 2. Backend Dependencies
The following are already in package.json:
- express
- mysql2
- cors
- dotenv
- axios

### 3. Environment Configuration
Create/update `.env` file in backend folder:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_inventory_db
API_PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 4. Run Backend
```bash
npm install
node backend/server.js
# Server will run on http://localhost:5000
```

---

## Frontend Configuration

### 1. Environment File
Create `.env` in project root:
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Run Frontend
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

---

## API Endpoints Reference

### Indent Endpoints
```
GET    /api/indents                    - Get all indents (with filtering)
GET    /api/indents/:id                - Get indent by ID
POST   /api/indents                    - Create new indent
PUT    /api/indents/:id                - Update indent
DELETE /api/indents/:id                - Delete indent
PATCH  /api/indents/:id/status         - Update status (approve/reject)
GET    /api/indents/status/:status     - Get indents by status
GET    /api/indents/department/:dept   - Get indents by department
```

### Purchase Order Endpoints
```
GET    /api/purchase-orders            - Get all purchase orders
GET    /api/purchase-orders/:id        - Get PO by ID
POST   /api/purchase-orders            - Create new PO
PUT    /api/purchase-orders/:id        - Update PO
DELETE /api/purchase-orders/:id        - Delete PO
PATCH  /api/purchase-orders/:id/status - Update PO status
GET    /api/purchase-orders/indent/:ref - Get PO by indent reference
GET    /api/purchase-orders/vendor/:id - Get PO by vendor
GET    /api/purchase-orders/status/:st - Get PO by status
```

### GRN Endpoints
```
GET    /api/grn                        - Get all GRNs
GET    /api/grn/:id                    - Get GRN by ID
POST   /api/grn                        - Create new GRN
PUT    /api/grn/:id                    - Update GRN
DELETE /api/grn/:id                    - Delete GRN
GET    /api/grn/po/:poRef              - Get GRN by PO reference
GET    /api/grn/status/:status         - Get GRN by status
GET    /api/grn/vendor/:vendorName     - Get GRN by vendor
```

### Inventory Endpoints
```
GET    /api/inventory                  - Get all stock movements
GET    /api/inventory/:id              - Get stock movement by ID
GET    /api/inventory/stock/levels     - Get current stock levels
GET    /api/inventory/item/:id/stock   - Get stock for specific item
POST   /api/inventory/stock-in         - Record stock in (from GRN)
POST   /api/inventory/stock-out        - Record stock out (issue)
POST   /api/inventory/transfer         - Record stock transfer
POST   /api/inventory/adjustment       - Record stock adjustment
GET    /api/inventory/item/:id/movements - Get item movements
GET    /api/inventory/low-stock        - Get items below reorder level
GET    /api/inventory/history/:id      - Get stock history for item
```

---

## Frontend Components - Your Modules

### 1. Indent Module
- **Page**: `src/features/indents/IndentListPage.jsx`
- **Components**:
  - IndentListPage - List all indents with filtering
  - IndentFormPage - Create/Edit indent
  - IndentDetailPage - View indent details
- **Redux Slice**: `src/features/indents/indentsSlice.js`

### 2. Purchase Order Module
- **Page**: `src/features/purchase-orders/POListPage.jsx`
- **Components**:
  - POListPage - List all POs
  - POFormPage - Create/Edit PO
  - PODetailPage - View PO details
- **Redux Slice**: `src/features/purchase-orders/purchaseOrdersSlice.js`

### 3. GRN Module
- **Page**: `src/features/grn/GRNListPage.jsx`
- **Components**:
  - GRNListPage - List all GRNs
  - GRNFormPage - Create/Receive goods
  - GRNDetailPage - View GRN details
- **Redux Slice**: `src/features/grn/grnSlice.js`

### 4. Inventory Module
- **Page**: `src/features/inventory/InventoryPage.jsx`
- **Redux Slice**: `src/features/inventory/inventorySlice.js`

---

## Module Workflow

### Indent Workflow
1. Employee creates indent (draft)
2. Submits indent for approval
3. Manager approves or rejects
4. If approved → Can create Purchase Order
5. If rejected → Shows rejection reason

### Purchase Order Workflow
1. Select approved indent
2. Choose vendor
3. Add items & rates
4. Calculate total with GST
5. Create PO
6. Track status: pending → confirmed → completed

### GRN Workflow
1. Create GRN against PO
2. Record received quantity
3. Check for damaged items
4. Accept goods
5. Automatic stock update
6. Record in inventory

### Inventory Workflow
1. Track all stock movements
2. Stock In - from GRN
3. Stock Out - from Issue/Return
4. Stock Transfer - between warehouses
5. Stock Adjustment - for discrepancies
6. Monitor low stock items
7. Generate reports

---

## Next Steps & Enhancements

### Immediate Tasks
- [ ] Create database tables from SQL above
- [ ] Test all API endpoints
- [ ] Connect frontend Redux to API calls
- [ ] Update frontend forms with validation
- [ ] Add loading states and error handling
- [ ] Implement pagination in list pages

### Refinements Needed
- [ ] Add role-based access control to API
- [ ] Implement search and advanced filtering
- [ ] Add bulk operations
- [ ] Create reports/export functionality
- [ ] Add audit logs
- [ ] Implement notifications
- [ ] Add PDF generation for PO/GRN

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for workflows
- [ ] Load testing
- [ ] Security testing (SQL injection, XSS, etc.)

---

## File Structure Created

```
backend/
├── server.js (Express server setup)
├── routes/
│   ├── indentRoutes.js
│   ├── purchaseOrderRoutes.js
│   ├── grnRoutes.js
│   └── inventoryRoutes.js
├── controller/
│   ├── indentController.js
│   ├── purchaseOrderController.js
│   ├── grnController.js
│   └── inventoryController.js
├── services/
│   ├── indentService.js
│   ├── purchaseOrderService.js
│   ├── grnService.js
│   └── inventoryService.js
├── utils/
│   └── codeGenerator.js
└── .env

src/
├── services/
│   └── api.js (Updated with API methods)
└── features/ (existing)
    ├── indents/
    ├── purchase-orders/
    ├── grn/
    └── inventory/
```

---

## Testing the Implementation

### 1. Start Backend
```bash
cd backend
npm install
node server.js
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Test Indent Creation
- Go to Indents page
- Click "Create New Indent"
- Fill details and submit

### 4. Test Purchase Order Workflow
- Approve an indent
- Create PO from approved indent
- Select vendor and add items

### 5. Test GRN
- Create GRN against PO
- Receive goods and verify quantities

### 6. Check Inventory
- View stock movements
- Check low stock items
- Monitor stock levels

---

## Troubleshooting

### Backend Issues
- Port already in use: Change API_PORT in .env
- Database connection error: Check DB credentials in .env
- CORS error: Verify CORS_ORIGIN in .env matches frontend URL

### Frontend Issues
- API 404 errors: Ensure backend is running
- Mock data showing: Check VITE_API_URL is correct in .env
- Redux not updating: Verify API response format matches state structure

---

## Additional Notes
- All code follows the existing project structure
- Uses Redux Toolkit for state management
- Material-UI for consistent UI
- Axios for HTTP requests
- ESM (ES6 modules) format

Good luck with your internship! 🚀
