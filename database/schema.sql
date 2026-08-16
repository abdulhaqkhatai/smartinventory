-- =========================================
-- SMART INVENTORY - INTERN 3
-- ASSET / ISSUE / RETURN MODULE
-- =========================================

-- 1. ASSETS
-- Stores all company assets

CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_code VARCHAR(50) NOT NULL UNIQUE,

    asset_name VARCHAR(150) NOT NULL,

    asset_type VARCHAR(100) NOT NULL,

    serial_number VARCHAR(100) UNIQUE,

    status ENUM(
        'AVAILABLE',
        'ISSUED',
        'DAMAGED'
    ) DEFAULT 'AVAILABLE',

    purchase_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- 2. ASSET ASSIGNMENTS
-- Stores which employee currently has which asset

CREATE TABLE IF NOT EXISTS asset_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    user_id INT NOT NULL,

    assigned_date DATE NOT NULL,

    returned_date DATE NULL,

    status ENUM(
        'ACTIVE',
        'RETURNED'
    ) DEFAULT 'ACTIVE',

    notes VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
);


-- 3. ISSUE TRANSACTIONS
-- Stores asset issue history

CREATE TABLE IF NOT EXISTS issue_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    user_id INT NOT NULL,

    issue_date DATE NOT NULL,

    expected_return_date DATE NULL,

    issue_condition VARCHAR(255),

    notes VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
);


-- 4. RETURN TRANSACTIONS
-- Stores asset return history

CREATE TABLE IF NOT EXISTS return_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    user_id INT NOT NULL,

    return_date DATE NOT NULL,

    return_condition VARCHAR(255),

    damage_description VARCHAR(255),

    notes VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
);