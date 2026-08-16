CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(100) NOT NULL UNIQUE,
    asset_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    serial_number VARCHAR(255),
    location VARCHAR(255),
    status ENUM(
        'AVAILABLE',
        'ISSUED',
        'DAMAGED'
    ) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    user_id INT NOT NULL,
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATETIME,
    issue_condition VARCHAR(255),
    notes TEXT,

    CONSTRAINT fk_issue_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS return_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    user_id INT NOT NULL,
    return_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    return_condition VARCHAR(255),
    damage_description TEXT,
    notes TEXT,

    CONSTRAINT fk_return_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);