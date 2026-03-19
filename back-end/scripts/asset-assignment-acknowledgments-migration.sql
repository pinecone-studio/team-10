CREATE TABLE IF NOT EXISTS asset_assignment_acknowledgments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_request_id INTEGER NOT NULL UNIQUE,
  asset_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_role TEXT,
  jwt_id TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  token_consumed_at TEXT,
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    email_status IN ('pending', 'sent', 'failed', 'skipped')
  ),
  email_sent_at TEXT,
  signer_name TEXT,
  signer_ip_address TEXT,
  signature_text TEXT,
  signed_at TEXT,
  pdf_object_key TEXT,
  pdf_file_name TEXT,
  pdf_uploaded_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'expired', 'void')
  ),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_request_id) REFERENCES asset_assignment_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_assignment_request_id
  ON asset_assignment_acknowledgments(assignment_request_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_asset_id
  ON asset_assignment_acknowledgments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_employee_id
  ON asset_assignment_acknowledgments(employee_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_jwt_id
  ON asset_assignment_acknowledgments(jwt_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_status
  ON asset_assignment_acknowledgments(status);
CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_email_status
  ON asset_assignment_acknowledgments(email_status);
