-- Smart Inventory & Store Management System
-- Database Setup Script for Abdul haq (Intern 2) - Your Modules
-- Modules: Purchase Indent, Purchase Order, GRN, Inventory

-- Create Database
CREATE DATABASE IF NOT EXISTS smart_inventory_db;
USE smart_inventory_db;

-- ============================================================
-- TABLE: Indents (Purchase Indent Request)
-- Purpose: Store purchase indent requests from departments
-- ============================================================
CREATE TABLE IF NOT EXISTS indents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'IND-2024-001, IND-2024-002, etc.',
    requested_by VARCHAR(150) NOT NULL COMMENT 'Employee name who requested',
    department VARCHAR(100) NOT NULL COMMENT 'Department requesting items',
    date DATE NOT NULL COMMENT 'Date of request',
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    items JSON NOT NULL COMMENT 'Array of items with quantity, remarks',
    remarks VARCHAR(500) COMMENT 'General remarks for the indent',
    approved_by VARCHAR(150) COMMENT 'Name of approver',
    approval_date DATE COMMENT 'Date of approval/rejection',
    rejection_reason VARCHAR(500) COMMENT 'Reason if rejected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_requested_by (requested_by),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: Purchase Orders
-- Purpose: Store purchase orders created from approved indents
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'PO-2024-001, PO-2024-002, etc.',
    vendor_id INT NOT NULL COMMENT 'Reference to vendor',
    vendor_name VARCHAR(150) NOT NULL COMMENT 'Vendor name',
    indent_ref VARCHAR(50) COMMENT 'Reference to related indent',
    date DATE NOT NULL COMMENT 'Date of PO creation',
    delivery_date DATE COMMENT 'Expected delivery date',
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    items JSON NOT NULL COMMENT 'Array of items with quantity, rate, GST',
    subtotal DECIMAL(12,2) COMMENT 'Subtotal amount',
    gst_amount DECIMAL(12,2) COMMENT 'GST amount',
    total_amount DECIMAL(12,2) COMMENT 'Total amount including GST',
    terms VARCHAR(500) COMMENT 'Purchase terms and conditions',
    payment_terms VARCHAR(100) COMMENT 'Payment terms (Net 30, etc.)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_indent_ref (indent_ref),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: GRNs (Goods Receipt Note)
-- Purpose: Record received goods from purchase orders
-- ============================================================
CREATE TABLE IF NOT EXISTS grns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'GRN-2024-001, GRN-2024-002, etc.',
    po_ref VARCHAR(50) NOT NULL COMMENT 'Reference to PO',
    vendor_name VARCHAR(150) COMMENT 'Vendor name from PO',
    date DATE NOT NULL COMMENT 'Date of goods receipt',
    received_by VARCHAR(150) NOT NULL COMMENT 'Name of person receiving goods',
    status ENUM('completed', 'partial') DEFAULT 'completed' COMMENT 'completed or partial delivery',
    items JSON NOT NULL COMMENT 'Array with ordered qty, received qty, damaged qty, accepted qty',
    remarks VARCHAR(500) COMMENT 'Remarks about the delivery (damage, quality issues, etc.)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_po_ref (po_ref),
    INDEX idx_status (status),
    INDEX idx_received_by (received_by),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: Stock Movements (Inventory Tracking)
-- Purpose: Record all stock movements and transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL COMMENT 'Reference to item',
    date DATE NOT NULL COMMENT 'Date of movement',
    type VARCHAR(50) NOT NULL COMMENT 'Stock In, Stock Out, Issue, Return, Transfer, Adjustment',
    quantity INT NOT NULL COMMENT 'Quantity moved (positive or negative)',
    reference VARCHAR(100) COMMENT 'Reference number (GRN-001, ISS-001, etc.)',
    warehouse VARCHAR(100) COMMENT 'Warehouse location',
    performed_by VARCHAR(150) COMMENT 'Name of person performing action',
    remarks VARCHAR(500) COMMENT 'Additional remarks',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_item_id (item_id),
    INDEX idx_type (type),
    INDEX idx_date (date),
    INDEX idx_reference (reference),
    INDEX idx_warehouse (warehouse)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ALTER existing items table to add stock management columns
-- Run these if the items table already exists from other team members
-- ============================================================
-- Uncomment and run if items table exists from other modules:
/*
ALTER TABLE items ADD COLUMN IF NOT EXISTS current_stock INT DEFAULT 0 COMMENT 'Current stock level';
ALTER TABLE items ADD COLUMN IF NOT EXISTS min_stock INT DEFAULT 0 COMMENT 'Minimum stock threshold';
ALTER TABLE items ADD COLUMN IF NOT EXISTS max_stock INT DEFAULT 0 COMMENT 'Maximum stock capacity';
ALTER TABLE items ADD COLUMN IF NOT EXISTS reorder_level INT DEFAULT 0 COMMENT 'Reorder point';
*/

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Sample Indent
INSERT INTO indents (code, requested_by, department, date, status, items, remarks)
VALUES (
    'IND-2024-001',
    'Sneha Reddy',
    'Engineering',
    '2024-12-15',
    'approved',
    '[{"itemId": 2, "itemName": "HP LaserJet Toner 12A", "quantity": 5, "unit": "PCS"}]',
    'Required for new setup'
);

-- Sample PO
INSERT INTO purchase_orders (code, vendor_id, vendor_name, indent_ref, date, delivery_date, status, items, subtotal, gst_amount, total_amount)
VALUES (
    'PO-2024-001',
    1,
    'TechWorld Solutions Pvt. Ltd.',
    'IND-2024-001',
    '2024-12-17',
    '2024-12-25',
    'pending',
    '[{"itemId": 2, "itemName": "HP LaserJet Toner 12A", "quantity": 5, "rate": 2450, "gstRate": 18}]',
    12250,
    2205,
    14455
);

-- Sample GRN
INSERT INTO grns (code, po_ref, vendor_name, date, received_by, status, items, remarks)
VALUES (
    'GRN-2024-001',
    'PO-2024-001',
    'TechWorld Solutions Pvt. Ltd.',
    '2024-12-24',
    'Priya Sharma',
    'completed',
    '[{"itemId": 2, "itemName": "HP LaserJet Toner 12A", "orderedQty": 5, "receivedQty": 5, "damagedQty": 0, "acceptedQty": 5}]',
    'All items received in good condition'
);

-- Sample Stock Movement
INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
VALUES (
    2,
    '2024-12-24',
    'Stock In',
    5,
    'GRN-2024-001',
    'Main Store',
    'Priya Sharma',
    'Stock received from GRN-2024-001'
);

-- ============================================================
-- VIEWS (Optional - for reporting)
-- ============================================================

-- View for low stock items
CREATE OR REPLACE VIEW low_stock_items AS
SELECT 
    id,
    code,
    name,
    current_stock,
    reorder_level,
    (reorder_level - current_stock) as quantity_to_order
FROM items
WHERE current_stock <= reorder_level
ORDER BY current_stock ASC;

-- View for pending purchase orders
CREATE OR REPLACE VIEW pending_pos AS
SELECT 
    id,
    code,
    vendor_name,
    date,
    delivery_date,
    total_amount,
    status
FROM purchase_orders
WHERE status IN ('pending', 'confirmed')
ORDER BY delivery_date ASC;

-- View for open indents
CREATE OR REPLACE VIEW open_indents AS
SELECT 
    id,
    code,
    requested_by,
    department,
    date,
    status
FROM indents
WHERE status IN ('draft', 'submitted')
ORDER BY date DESC;

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
-- Already created in table definitions above

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Replace "id INT NOT NULL" references with actual vendor/item/user IDs from existing tables
-- 2. Adjust data types as needed for your existing schema
-- 3. Ensure foreign key relationships are maintained
-- 4. Keep audit trails (created_at, updated_at) for compliance
-- 5. Use JSON columns for flexible item arrays
-- 6. All important fields are indexed for quick querying

-- ============================================================
-- END OF SCRIPT
-- ============================================================
