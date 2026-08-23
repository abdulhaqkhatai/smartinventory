-- ============================================================
-- SMART INVENTORY
-- INTERN 2 + INTERN 3
-- FINAL DATABASE SCHEMA
-- ============================================================


-- ============================================================
-- INTERN 2
-- PURCHASE + INVENTORY
-- ============================================================


-- ============================================================
-- 1. INDENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS indents (
    id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(50) NOT NULL UNIQUE,

    requested_by VARCHAR(150) NOT NULL,

    department VARCHAR(100) NOT NULL,

    date DATE NOT NULL,

    status ENUM(
        'draft',
        'submitted',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'draft',

    items JSON NOT NULL,

    remarks VARCHAR(500),

    approved_by VARCHAR(150),

    approval_date DATE,

    rejection_reason VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_indent_code (code),
    INDEX idx_indent_status (status),
    INDEX idx_indent_department (department),
    INDEX idx_indent_requested_by (requested_by),
    INDEX idx_indent_date (date)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. PURCHASE ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(50) NOT NULL UNIQUE,

    vendor_id INT,

    vendor_name VARCHAR(150) NOT NULL,

    indent_ref VARCHAR(50),

    date DATE NOT NULL,

    delivery_date DATE,

    status ENUM(
        'pending',
        'confirmed',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',

    items JSON NOT NULL,

    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    terms VARCHAR(500),

    payment_terms VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_po_code (code),
    INDEX idx_po_vendor (vendor_id),
    INDEX idx_po_status (status),
    INDEX idx_po_indent_ref (indent_ref),
    INDEX idx_po_date (date)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. GRNs
-- ============================================================

CREATE TABLE IF NOT EXISTS grns (
    id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(50) NOT NULL UNIQUE,

    po_ref VARCHAR(50) NOT NULL,

    vendor_name VARCHAR(150),

    date DATE NOT NULL,

    received_by VARCHAR(150) NOT NULL,

    status ENUM(
        'completed',
        'partial'
    ) NOT NULL DEFAULT 'completed',

    items JSON NOT NULL,

    remarks VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_grn_code (code),
    INDEX idx_grn_po_ref (po_ref),
    INDEX idx_grn_status (status),
    INDEX idx_grn_received_by (received_by),
    INDEX idx_grn_date (date)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. STOCK MOVEMENTS
-- Inventory → Stock Movements
-- ============================================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,

    item_id INT,

    date DATE NOT NULL,

    type ENUM(
        'IN',
        'OUT'
    ) NOT NULL,

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
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. STOCK ADJUSTMENTS
-- Inventory → Stock Adjustment
-- ============================================================

CREATE TABLE IF NOT EXISTS stock_adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    item_id INT,

    adjustment_type ENUM(
        'INCREASE',
        'DECREASE'
    ) NOT NULL,

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
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- INTERN 3
-- ASSETS + ISSUE + RETURN
-- ============================================================


-- ============================================================
-- 6. ASSETS
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

    status ENUM(
        'AVAILABLE',
        'ISSUED',
        'DAMAGED'
    ) NOT NULL DEFAULT 'AVAILABLE',

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_asset_code (asset_code),
    INDEX idx_asset_category (category),
    INDEX idx_asset_serial (serial_number),
    INDEX idx_asset_status (status),
    INDEX idx_asset_location (location)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. ISSUE TRANSACTIONS
-- Issue & Return → Issues
-- ============================================================

CREATE TABLE IF NOT EXISTS issue_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    user_id INT,

    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    expected_return_date DATETIME,

    issue_condition VARCHAR(255),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_issue_asset (asset_id),
    INDEX idx_issue_user (user_id),
    INDEX idx_issue_date (issue_date)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. RETURN TRANSACTIONS
-- Issue & Return → Returns
-- ============================================================

CREATE TABLE IF NOT EXISTS return_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    user_id INT,

    return_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    return_condition VARCHAR(255),

    damage_description TEXT,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_return_asset (asset_id),
    INDEX idx_return_user (user_id),
    INDEX idx_return_date (return_date)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. ASSET ASSIGNMENTS
-- Used by Issue & Return module
-- ============================================================

CREATE TABLE IF NOT EXISTS asset_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    user_id INT,

    status ENUM(
        'ACTIVE',
        'RETURNED'
    ) NOT NULL DEFAULT 'ACTIVE',

    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    returned_date DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_assignment_asset (asset_id),

    INDEX idx_assignment_user (user_id),

    INDEX idx_assignment_status (status),

    INDEX idx_assignment_assigned_date (assigned_date)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;