PRAGMA defer_foreign_keys = TRUE;

DROP TABLE IF EXISTS asset_disposals;
DROP TABLE IF EXISTS asset_distributions;
DROP TABLE IF EXISTS asset_assignment_requests;
DROP TABLE IF EXISTS asset_attributes;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS storage;
DROP TABLE IF EXISTS receive_items;
DROP TABLE IF EXISTS receives;
DROP TABLE IF EXISTS order_item_images;
DROP TABLE IF EXISTS order_item_attributes;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS inventory_assets;
DROP TABLE IF EXISTS asset_types;
DROP TABLE IF EXISTS order_processes;
DROP TABLE IF EXISTS offices;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_user_id TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (
    role IN (
      'employee',
      'inventoryHead',
      'finance',
      'itAdmin',
      'hrManager',
      'systemAdmin'
    )
  ),
  password_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  office_name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_processes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  process_name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user INTEGER NOT NULL,
  office_id INTEGER NOT NULL,
  -- thh zuvhun one process
  order_process_id INTEGER NOT NULL,
  why_ordered TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN (
      'pending',
      'approved',
      'rejected',
      'ordered',
      'partiallyReceived',
      'received',
      'closed'
    )
  ),
  expected_arrival_at TEXT,
  total_cost REAL CHECK (total_cost >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user) REFERENCES users(id),
  FOREIGN KEY (office_id) REFERENCES offices(id),
  FOREIGN KEY (order_process_id) REFERENCES order_processes(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost REAL NOT NULL CHECK (unit_cost >= 0),
  from_where TEXT NOT NULL,
  additional_notes TEXT,
  eta TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_item_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_item_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  UNIQUE (order_item_id, image_url)
);

CREATE TABLE IF NOT EXISTS order_item_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_item_id INTEGER NOT NULL,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  UNIQUE (order_item_id, attribute_name)
);

CREATE TABLE IF NOT EXISTS receives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  received_by_user_id INTEGER NOT NULL,
  office_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN (
      'pending',
      'partiallyReceived',
      'received',
      'cancelled'
    )
  ),
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (received_by_user_id) REFERENCES users(id),
  FOREIGN KEY (office_id) REFERENCES offices(id)
);

CREATE TABLE IF NOT EXISTS receive_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receive_id INTEGER NOT NULL,
  order_item_id INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL CHECK (quantity_received > 0),
  condition_status TEXT NOT NULL CHECK (
    condition_status IN (
      'good',
      'fair',
      'damaged',
      'defective',
      'incomplete',
      'used'
    )
  ),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receive_id) REFERENCES receives(id) ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);

CREATE TABLE IF NOT EXISTS storage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storage_name TEXT NOT NULL UNIQUE,
  storage_type TEXT NOT NULL CHECK (
    storage_type IN (
      'room',
      'shelf',
      'cabinet',
      'locker',
      'warehouse',
      'vault'
    )
  ),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receive_item_id INTEGER NOT NULL,
  asset_code TEXT NOT NULL UNIQUE,
  qr_code TEXT NOT NULL UNIQUE,
  asset_name TEXT NOT NULL,
  category TEXT NOT NULL,
  serial_number TEXT,
  condition_status TEXT NOT NULL CHECK (
    condition_status IN (
      'good',
      'fair',
      'damaged',
      'defective',
      'incomplete',
      'used'
    )
  ),
  asset_status TEXT NOT NULL CHECK (
    asset_status IN (
      'received',
      'inStorage',
      'available',
      'pendingAssignment',
      'assigned',
      'inRepair',
      'pendingDisposal',
      'sold',
      'disposed',
      'lost'
    )
  ),
  current_storage_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receive_item_id) REFERENCES receive_items(id) ON DELETE CASCADE,
  FOREIGN KEY (current_storage_id) REFERENCES storage(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS asset_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  UNIQUE (asset_id, attribute_name)
);

CREATE TABLE IF NOT EXISTS asset_assignment_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  employee_scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by_user_id INTEGER,
  reviewed_at TEXT,
  review_note TEXT,
  status TEXT NOT NULL CHECK (
    status IN (
      'pending',
      'approved',
      'declined',
      'cancelled'
    )
  ),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS asset_distributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_request_id INTEGER UNIQUE,
  asset_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  distributed_by_user_id INTEGER NOT NULL,
  distributed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (
    status IN (
      'pendingHandover',
      'active',
      'returned',
      'cancelled'
    )
  ),
  returned_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_request_id) REFERENCES asset_assignment_requests(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (distributed_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS asset_disposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  requested_by_user_id INTEGER NOT NULL,
  approved_by_user_id INTEGER,
  disposed_by_user_id INTEGER,
  status TEXT NOT NULL CHECK (
    status IN (
      'pending',
      'financeApproved',
      'disposed',
      'cancelled'
    )
  ),
  disposal_reason TEXT NOT NULL,
  disposal_method TEXT CHECK (
    disposal_method IS NULL OR disposal_method IN (
      'sale',
      'donation',
      'recycle',
      'destroy',
      'returnToVendor',
      'other'
    )
  ),
  disposed_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (requested_by_user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id),
  FOREIGN KEY (disposed_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_offices_office_name ON offices(office_name);
CREATE INDEX IF NOT EXISTS idx_order_processes_process_name ON order_processes(process_name);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user);
CREATE INDEX IF NOT EXISTS idx_orders_office_id ON orders(office_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_process_id ON orders(order_process_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_expected_arrival_at ON orders(expected_arrival_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_category ON order_items(category);
CREATE INDEX IF NOT EXISTS idx_order_item_images_order_item_id ON order_item_images(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_images_sort_order ON order_item_images(sort_order);

CREATE INDEX IF NOT EXISTS idx_order_item_attributes_order_item_id ON order_item_attributes(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_attributes_name_value ON order_item_attributes(attribute_name, attribute_value);

CREATE INDEX IF NOT EXISTS idx_receives_order_id ON receives(order_id);
CREATE INDEX IF NOT EXISTS idx_receives_received_by_user_id ON receives(received_by_user_id);
CREATE INDEX IF NOT EXISTS idx_receives_office_id ON receives(office_id);
CREATE INDEX IF NOT EXISTS idx_receives_status ON receives(status);

CREATE INDEX IF NOT EXISTS idx_receive_items_receive_id ON receive_items(receive_id);
CREATE INDEX IF NOT EXISTS idx_receive_items_order_item_id ON receive_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_receive_items_condition_status ON receive_items(condition_status);

CREATE INDEX IF NOT EXISTS idx_assets_receive_item_id ON assets(receive_item_id);
CREATE INDEX IF NOT EXISTS idx_assets_current_storage_id ON assets(current_storage_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_status ON assets(asset_status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON assets(serial_number);

CREATE INDEX IF NOT EXISTS idx_asset_attributes_asset_id ON asset_attributes(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_attributes_name_value ON asset_attributes(attribute_name, attribute_value);

CREATE INDEX IF NOT EXISTS idx_asset_assignment_requests_asset_id ON asset_assignment_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignment_requests_employee_id ON asset_assignment_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignment_requests_status ON asset_assignment_requests(status);

CREATE INDEX IF NOT EXISTS idx_asset_distributions_asset_id ON asset_distributions(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_distributions_employee_id ON asset_distributions(employee_id);
CREATE INDEX IF NOT EXISTS idx_asset_distributions_status ON asset_distributions(status);

CREATE INDEX IF NOT EXISTS idx_asset_disposals_asset_id ON asset_disposals(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_disposals_status ON asset_disposals(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
