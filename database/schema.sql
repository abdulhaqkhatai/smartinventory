CREATE TABLE issue_returns (
    id INT AUTO_INCREMENT PRIMARY KEY,

    item_id INT NOT NULL,

    issued_to VARCHAR(150) NOT NULL,

    quantity INT NOT NULL,

    issue_date DATE NOT NULL,

    return_date DATE NULL,

    transaction_type ENUM('ISSUE', 'RETURN') NOT NULL,

    status ENUM('ISSUED', 'PARTIAL_RETURN', 'RETURNED')
        DEFAULT 'ISSUED',

    remarks VARCHAR(500) NULL,

    parent_issue_id INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_issue_id)
        REFERENCES issue_returns(id)
        ON DELETE SET NULL
);


CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_code VARCHAR(100) NOT NULL UNIQUE,

    asset_name VARCHAR(150) NOT NULL,

    category VARCHAR(100),

    item_id INT NULL,

    serial_number VARCHAR(150) UNIQUE,

    purchase_date DATE NULL,

    purchase_cost DECIMAL(12,2) DEFAULT 0,

    assigned_to VARCHAR(150) NULL,

    assigned_department VARCHAR(150) NULL,

    location VARCHAR(200) NULL,

    status ENUM(
        'AVAILABLE',
        'ASSIGNED',
        'UNDER_MAINTENANCE',
        'DAMAGED',
        'DISPOSED'
    ) DEFAULT 'AVAILABLE',

    description VARCHAR(500) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);




CREATE TABLE asset_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    assigned_to VARCHAR(150) NOT NULL,

    department VARCHAR(150),

    location VARCHAR(200),

    assigned_date DATE NOT NULL,

    returned_date DATE NULL,

    status ENUM('ASSIGNED', 'RETURNED')
        DEFAULT 'ASSIGNED',

    remarks VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
);



CREATE TABLE asset_maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,

    asset_id INT NOT NULL,

    maintenance_date DATE NOT NULL,

    maintenance_type VARCHAR(150),

    description VARCHAR(500),

    cost DECIMAL(12,2) DEFAULT 0,

    status ENUM(
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
);