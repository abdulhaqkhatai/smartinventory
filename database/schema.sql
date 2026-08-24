-- Smart Inventory Management System
-- Database Schema for Core Features & Integration

-- ===================================
-- USERS TABLE (Authentication & Roles)
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- 'admin', 'store_manager', 'purchase_manager', 'employee', 'user'
  location VARCHAR(100) DEFAULT 'General',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- ===================================
CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'Piece',
  hsn_code VARCHAR(50),
  gst_rate DECIMAL(5, 2) DEFAULT 18.00,
  min_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 0,
  max_stock INT DEFAULT 0,
  quantity_in_stock INT DEFAULT 0,
  unit_price DECIMAL(10, 2) DEFAULT 0.00,
  image_url VARCHAR(500) DEFAULT '',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_category (category),
  UNIQUE KEY unique_item_name (name)
);

-- ===================================
-- VENDORS TABLE (Vendor Management)
-- ===================================
CREATE TABLE IF NOT EXISTS vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  gst_number VARCHAR(50),
  pan_number VARCHAR(50),
  bank_name VARCHAR(100),
  bank_account VARCHAR(50),
  bank_ifsc VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  rating INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_status (status),
  INDEX idx_email (email)
);

-- ===================================
-- INDENTS TABLE (Purchase Indents)
-- ===================================
CREATE TABLE IF NOT EXISTS indents (
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department)
);

-- ===================================
-- PURCHASE ORDERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS purchase_orders (
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_vendor_id (vendor_id)
);

-- ===================================
-- GRN TABLE (Goods Receipt Note)
-- ===================================
CREATE TABLE IF NOT EXISTS grn_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  po_ref VARCHAR(50) NOT NULL,
  vendor_name VARCHAR(150) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  received_date DATE NOT NULL,
  received_by VARCHAR(150) NOT NULL,
  status ENUM('draft', 'verified', 'rejected') DEFAULT 'draft',
  items JSON NOT NULL,
  remarks VARCHAR(500),
  verified_by VARCHAR(150),
  verification_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_po_ref (po_ref)
);

-- ===================================
-- INVENTORY MOVEMENTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_code VARCHAR(50) NOT NULL,
  movement_type ENUM('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT') NOT NULL,
  item_id INT NOT NULL,
  item_code VARCHAR(50),
  item_name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  total_value DECIMAL(12,2),
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  reference_type VARCHAR(50),
  reference_id VARCHAR(50),
  performed_by VARCHAR(150) NOT NULL,
  notes VARCHAR(500),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_movement_type (movement_type),
  INDEX idx_item_id (item_id),
  INDEX idx_date (date)
);

-- ===================================
-- SEED INITIAL USERS WITH ALL 4 ROLES (password: admin123)
-- ===================================
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2a$10$l6vAWfZb5Yj/yGFX9SwO4.0kTDHM3.2akumKm.0A5fFtsVGlFhRYC', 'admin'),
('store_manager', 'store@example.com', '$2a$10$l6vAWfZb5Yj/yGFX9SwO4.0kTDHM3.2akumKm.0A5fFtsVGlFhRYC', 'store_manager'),
('purchase_manager', 'purchase@example.com', '$2a$10$l6vAWfZb5Yj/yGFX9SwO4.0kTDHM3.2akumKm.0A5fFtsVGlFhRYC', 'purchase_manager'),
('employee', 'employee@example.com', '$2a$10$l6vAWfZb5Yj/yGFX9SwO4.0kTDHM3.2akumKm.0A5fFtsVGlFhRYC', 'employee'),
('user1', 'user1@example.com', '$2a$10$l6vAWfZb5Yj/yGFX9SwO4.0kTDHM3.2akumKm.0A5fFtsVGlFhRYC', 'employee')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role);

-- ===================================
-- SEED INITIAL ITEMS
-- ===================================
INSERT IGNORE INTO items (code, name, category, brand, unit, hsn_code, gst_rate, min_stock, reorder_level, max_stock, quantity_in_stock, unit_price, image_url) VALUES
('ITM-0001', 'Laptop Dell XPS 13', 'Electronics', 'Dell', 'Piece', '8471.30', 18.00, 2, 5, 20, 10, 85000.00, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200'),
('ITM-0002', 'Wireless Mouse', 'Electronics', 'Logitech', 'Piece', '8517.62', 18.00, 10, 20, 100, 50, 2500.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200'),
('ITM-0003', 'USB-C Cable 2M', 'Accessories', 'Generic', 'Piece', '8544.30', 5.00, 20, 50, 500, 200, 300.00, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'),
('ITM-0004', 'Monitor 27 Inch', 'Electronics', 'LG', 'Piece', '8528.72', 18.00, 2, 5, 15, 8, 25000.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200'),
('ITM-0005', 'Keyboard Mechanical', 'Accessories', 'Corsair', 'Piece', '8471.30', 18.00, 5, 10, 50, 25, 8000.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200');

-- ===================================
-- SEED INITIAL VENDORS
-- ===================================
INSERT IGNORE INTO vendors (name, contact_person, email, phone, city, state, gst_number, pan_number, bank_name, bank_account, bank_ifsc, status, rating) VALUES
('Tech Solutions Ltd', 'Rajesh Kumar', 'rajesh@techsol.com', '9876543210', 'Mumbai', 'Maharashtra', '27AABCT1234H1Z0', 'AAAPA1234K', 'HDFC Bank', '1234567890123', 'HDFC0000001', 'active', 4),
('Digital Supplies Co', 'Priya Sharma', 'priya@digsup.com', '9876543211', 'Delhi', 'Delhi', '07AABCS5678H2Z1', 'BBBPB5678L', 'ICICI Bank', '0987654321098', 'ICIC0000002', 'active', 5),
('Electronics Hub', 'Amit Patel', 'amit@elecHub.com', '9876543212', 'Bangalore', 'Karnataka', '29AABCU9012H3Z2', 'CCCPC9012M', 'Axis Bank', '1122334455667', 'AXIS0000003', 'active', 3),
('Global Import Services', 'Sanjay Singh', 'sanjay@globalimp.com', '9876543213', 'Pune', 'Maharashtra', '27AABCV3456H4Z3', 'DDDPD3456N', 'BOB Bank', '9988776655443', 'BARB0000004', 'inactive', 2),
('Premium Distributors', 'Neha Gupta', 'neha@premdist.com', '9876543214', 'Hyderabad', 'Telangana', '36AABCW7890H5Z4', 'EEEPV7890O', 'SBI Bank', '5566778899001', 'SBIN0000005', 'blacklisted', 1);
-- ============================================================
-- 10. GRNs (Intern 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS grns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    po_ref VARCHAR(50) NOT NULL,
    vendor_name VARCHAR(150),
    date DATE NOT NULL,
    received_by VARCHAR(150) NOT NULL,
    status ENUM('completed','partial') NOT NULL DEFAULT 'completed',
    items JSON NOT NULL,
    remarks VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_grn_code (code),
    INDEX idx_grn_po_ref (po_ref),
    INDEX idx_grn_status (status),
    INDEX idx_grn_received_by (received_by),
    INDEX idx_grn_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. STOCK MOVEMENTS (Intern 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    reference VARCHAR(100),
    warehouse VARCHAR(100),
    performed_by VARCHAR(150),
    remarks VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stock_item (item_id),
    INDEX idx_stock_type (type),
    INDEX idx_stock_date (date),
    INDEX idx_stock_reference (reference),
    INDEX idx_stock_warehouse (warehouse)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. STOCK ADJUSTMENTS (Intern 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    adjustment_type ENUM('INCREASE','DECREASE') NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL DEFAULT 0,
    new_stock INT NOT NULL DEFAULT 0,
    reason VARCHAR(500) NOT NULL,
    warehouse VARCHAR(100),
    adjusted_by VARCHAR(150),
    adjustment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_adjustment_item (item_id),
    INDEX idx_adjustment_type (adjustment_type),
    INDEX idx_adjustment_date (adjustment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. ASSETS (Intern 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(100) NOT NULL UNIQUE,
    asset_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    serial_number VARCHAR(255),
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    location VARCHAR(255),
    status ENUM('AVAILABLE','ISSUED','DAMAGED') NOT NULL DEFAULT 'AVAILABLE',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asset_code (asset_code),
    INDEX idx_asset_category (category),
    INDEX idx_asset_serial (serial_number),
    INDEX idx_asset_status (status),
    INDEX idx_asset_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. ISSUE TRANSACTIONS (Intern 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS issue_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    user_id INT,
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATETIME,
    issue_condition VARCHAR(255),
    notes TEXT,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_issue_asset (asset_id),
    INDEX idx_issue_user (user_id),
    INDEX idx_issue_date (issue_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. RETURN TRANSACTIONS (Intern 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS return_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    user_id INT,
    return_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    return_condition VARCHAR(255),
    damage_description TEXT,
    notes TEXT,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_return_asset (asset_id),
    INDEX idx_return_user (user_id),
    INDEX idx_return_date (return_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. ASSET ASSIGNMENTS (Intern 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS asset_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    user_id INT,
    status ENUM('ACTIVE','RETURNED') NOT NULL DEFAULT 'ACTIVE',
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    returned_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assignment_asset (asset_id),
    INDEX idx_assignment_user (user_id),
    INDEX idx_assignment_status (status),
    INDEX idx_assignment_assigned_date (assigned_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIEWS (for reporting)
-- ============================================================
CREATE OR REPLACE VIEW low_stock_items AS
SELECT id, code, name, quantity_in_stock as current_stock, reorder_level, 
       (reorder_level - quantity_in_stock) as quantity_to_order
FROM items
WHERE quantity_in_stock <= reorder_level
ORDER BY quantity_in_stock ASC;

CREATE OR REPLACE VIEW pending_pos AS
SELECT id, code, vendor_name, date, delivery_date, total_amount, status
FROM purchase_orders
WHERE status IN ('pending', 'confirmed')
ORDER BY delivery_date ASC;

CREATE OR REPLACE VIEW open_indents AS
SELECT id, code, requested_by, department, date, status
FROM indents
WHERE status IN ('draft', 'submitted')
ORDER BY date DESC;

