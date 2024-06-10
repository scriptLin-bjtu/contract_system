CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_name VARCHAR(255) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('draft', 'internal_review', 'negotiation', 'approval', 'signed', 'archived', 'executing') NOT NULL DEFAULT 'draft',
    finalized BOOLEAN DEFAULT FALSE,
    attachment VARCHAR(255),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
ALTER TABLE contracts
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

ALTER TABLE contract_process MODIFY COLUMN completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE contract_process (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    step VARCHAR(255) NOT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);
CREATE TABLE user_contract_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contract_id INT NOT NULL,
    permission ENUM('view', 'edit', 'sign') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

CREATE TABLE contract_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    change_description TEXT NOT NULL,
    changed_by INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE TABLE contract_signatures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    signed_by INT NOT NULL,
    comment TEXT,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    signature_type ENUM('electronic', 'manual') NOT NULL,
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (signed_by) REFERENCES users(id)
);
CREATE TABLE user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    can_draft_contract BOOLEAN DEFAULT FALSE,
    can_countersign_contract BOOLEAN DEFAULT FALSE,
    can_finalize_contract BOOLEAN DEFAULT FALSE,
    can_approve_contract BOOLEAN DEFAULT FALSE,
    can_sign_contract BOOLEAN DEFAULT FALSE,
    can_query_contract BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


