PRAGMA defer_foreign_keys = TRUE;

DROP TABLE IF EXISTS asset_disposals;
DROP TABLE IF EXISTS asset_distributions;
DROP TABLE IF EXISTS asset_assignment_requests;
DROP TABLE IF EXISTS asset_attributes;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS storage;
DROP TABLE IF EXISTS receive_items;
DROP TABLE IF EXISTS receives;
DROP TABLE IF EXISTS order_approval_steps;
DROP TABLE IF EXISTS order_item_images;
DROP TABLE IF EXISTS order_item_attributes;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS catalog_product_attributes;
DROP TABLE IF EXISTS catalog_product_images;
DROP TABLE IF EXISTS catalog_products;
DROP TABLE IF EXISTS catalog_attribute_aliases;
DROP TABLE IF EXISTS catalog_type_aliases;
DROP TABLE IF EXISTS catalog_category_aliases;
DROP TABLE IF EXISTS catalog_attribute_definitions;
DROP TABLE IF EXISTS catalog_item_types;
DROP TABLE IF EXISTS catalog_categories;
DROP TABLE IF EXISTS order_approvers;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS inventory_assets;
DROP TABLE IF EXISTS asset_types;
DROP TABLE IF EXISTS order_processes;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS offices;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS todos;

CREATE TABLE IF NOT EXISTS offices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  office_name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO departments (department_name, description) VALUES
  ('IT Office', 'Seeded default department'),
  ('Finance Office', 'Seeded default department'),
  ('Human Resources', 'Seeded default department'),
  ('Operations', 'Seeded default department'),
  ('Procurement', 'Seeded default department'),
  ('Administration', 'Seeded default department'),
  ('Facilities', 'Seeded default department'),
  ('Legal', 'Seeded default department'),
  ('Sales', 'Seeded default department'),
  ('Marketing', 'Seeded default department'),
  ('Customer Service', 'Seeded default department'),
  ('Logistics', 'Seeded default department'),
  ('Engineering', 'Seeded default department'),
  ('Executive Office', 'Seeded default department');

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
  position TEXT NOT NULL DEFAULT 'staff' CHECK (
    position IN (
      'staff',
      'ceo',
      'generalManager',
      'cfo',
      'coo',
      'cto',
      'departmentHead',
      'departmentManager',
      'manager',
      'custom'
    )
  ),
  department_id INTEGER,
  password_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_approvers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  approval_queue TEXT NOT NULL CHECK (
    approval_queue IN (
      'anyHigherUps',
      'finance'
    )
  ),
  approval_scope TEXT NOT NULL CHECK (
    approval_scope IN (
      'company',
      'office',
      'department'
    )
  ),
  office_id INTEGER,
  department_id INTEGER,
  approval_limit REAL CHECK (approval_limit IS NULL OR approval_limit >= 0),
  note TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CHECK (
    (approval_scope = 'company' AND office_id IS NULL AND department_id IS NULL)
    OR (approval_scope = 'office' AND office_id IS NOT NULL AND department_id IS NULL)
    OR (approval_scope = 'department' AND department_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_name TEXT NOT NULL,
  request_number TEXT UNIQUE,
  request_date TEXT,
  requester_name TEXT,
  user INTEGER NOT NULL,
  office_id INTEGER NOT NULL,
  department_id INTEGER,
  why_ordered TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN (
      'pendingHigherUpApproval',
      'rejectedByHigherUp',
      'pendingFinanceApproval',
      'rejectedByFinance',
      'financeApproved',
      'ordered',
      'partiallyReceived',
      'received',
      'closed'
    )
  ),
  approval_target TEXT NOT NULL DEFAULT 'anyHigherUps' CHECK (
    approval_target IN (
      'anyHigherUps',
      'finance'
    )
  ),
  expected_arrival_at TEXT,
  total_cost REAL CHECK (total_cost >= 0),
  currency_code TEXT NOT NULL DEFAULT 'MNT' CHECK (
    currency_code IN (
      'USD',
      'MNT',
      'EUR'
    )
  ),
  requested_approver_id TEXT,
  requested_approver_name TEXT,
  requested_approver_role TEXT,
  approval_message TEXT,
  higher_up_reviewer TEXT,
  higher_up_reviewed_at TEXT,
  higher_up_note TEXT,
  finance_reviewer TEXT,
  finance_reviewed_at TEXT,
  finance_note TEXT,
  received_at TEXT,
  received_condition TEXT CHECK (
    received_condition IS NULL OR received_condition IN (
      'complete',
      'issue'
    )
  ),
  received_note TEXT,
  storage_location TEXT,
  serial_numbers_json TEXT,
  assigned_to TEXT,
  assigned_role TEXT,
  assigned_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user) REFERENCES users(id),
  FOREIGN KEY (office_id) REFERENCES offices(id),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_approval_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  step_order INTEGER NOT NULL CHECK (step_order > 0),
  approval_queue TEXT NOT NULL CHECK (
    approval_queue IN (
      'anyHigherUps',
      'finance'
    )
  ),
  status TEXT NOT NULL CHECK (
    status IN (
      'pending',
      'approved',
      'rejected',
      'cancelled'
    )
  ),
  acted_by_user_id INTEGER,
  acted_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (acted_by_user_id) REFERENCES users(id),
  UNIQUE (order_id, step_order)
);

CREATE TABLE IF NOT EXISTS catalog_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',
      'active',
      'archived'
    )
  ),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (
    source IN (
      'system',
      'promoted',
      'manual'
    )
  ),
  created_by_user_id INTEGER,
  approved_by_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS catalog_category_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  alias_name TEXT NOT NULL,
  normalized_alias TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE CASCADE,
  UNIQUE (category_id, alias_name)
);

CREATE TABLE IF NOT EXISTS catalog_item_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',
      'active',
      'archived'
    )
  ),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (
    source IN (
      'system',
      'promoted',
      'manual'
    )
  ),
  created_by_user_id INTEGER,
  approved_by_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (category_id, normalized_name)
);

CREATE TABLE IF NOT EXISTS catalog_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type_id INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  product_code TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL DEFAULT 'pcs',
  default_currency_code TEXT NOT NULL DEFAULT 'MNT' CHECK (
    default_currency_code IN ('USD', 'MNT', 'EUR')
  ),
  default_unit_cost REAL CHECK (default_unit_cost IS NULL OR default_unit_cost >= 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',
      'active',
      'archived'
    )
  ),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (
    source IN (
      'system',
      'promoted',
      'manual'
    )
  ),
  created_by_user_id INTEGER,
  approved_by_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_type_id) REFERENCES catalog_item_types(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (item_type_id, normalized_name)
);

CREATE TABLE IF NOT EXISTS catalog_type_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type_id INTEGER NOT NULL,
  alias_name TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_type_id) REFERENCES catalog_item_types(id) ON DELETE CASCADE,
  UNIQUE (item_type_id, alias_name),
  UNIQUE (item_type_id, normalized_alias)
);

CREATE TABLE IF NOT EXISTS catalog_attribute_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type_id INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',
      'active',
      'archived'
    )
  ),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (
    source IN (
      'system',
      'promoted',
      'manual'
    )
  ),
  created_by_user_id INTEGER,
  approved_by_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_type_id) REFERENCES catalog_item_types(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (item_type_id, normalized_name)
);

CREATE TABLE IF NOT EXISTS catalog_attribute_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attribute_definition_id INTEGER NOT NULL,
  alias_name TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attribute_definition_id) REFERENCES catalog_attribute_definitions(id) ON DELETE CASCADE,
  UNIQUE (attribute_definition_id, alias_name),
  UNIQUE (attribute_definition_id, normalized_alias)
);

CREATE TABLE IF NOT EXISTS catalog_product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  UNIQUE (product_id, image_url)
);

CREATE TABLE IF NOT EXISTS catalog_product_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  catalog_attribute_definition_id INTEGER,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  FOREIGN KEY (catalog_attribute_definition_id) REFERENCES catalog_attribute_definitions(id) ON DELETE SET NULL,
  UNIQUE (product_id, attribute_name)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  item_code TEXT NOT NULL,
  category TEXT NOT NULL,
  item_type TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  catalog_category_id INTEGER,
  catalog_item_type_id INTEGER,
  catalog_product_id INTEGER,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost REAL NOT NULL CHECK (unit_cost >= 0),
  currency_code TEXT NOT NULL DEFAULT 'MNT' CHECK (
    currency_code IN (
      'USD',
      'MNT',
      'EUR'
    )
  ),
  from_where TEXT NOT NULL,
  additional_notes TEXT,
  eta TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (catalog_category_id) REFERENCES catalog_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (catalog_item_type_id) REFERENCES catalog_item_types(id) ON DELETE SET NULL,
  FOREIGN KEY (catalog_product_id) REFERENCES catalog_products(id) ON DELETE SET NULL
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
  catalog_attribute_definition_id INTEGER,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (catalog_attribute_definition_id) REFERENCES catalog_attribute_definitions(id) ON DELETE SET NULL,
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
  item_type TEXT NOT NULL,
  catalog_item_type_id INTEGER,
  catalog_product_id INTEGER,
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
  FOREIGN KEY (catalog_item_type_id) REFERENCES catalog_item_types(id) ON DELETE SET NULL,
  FOREIGN KEY (catalog_product_id) REFERENCES catalog_products(id) ON DELETE SET NULL,
  FOREIGN KEY (current_storage_id) REFERENCES storage(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS asset_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  catalog_attribute_definition_id INTEGER,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (catalog_attribute_definition_id) REFERENCES catalog_attribute_definitions(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_users_position ON users(position);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);

CREATE INDEX IF NOT EXISTS idx_offices_office_name ON offices(office_name);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(department_name);

CREATE INDEX IF NOT EXISTS idx_order_approvers_user_id ON order_approvers(user_id);
CREATE INDEX IF NOT EXISTS idx_order_approvers_queue ON order_approvers(approval_queue);
CREATE INDEX IF NOT EXISTS idx_order_approvers_scope ON order_approvers(approval_scope);
CREATE INDEX IF NOT EXISTS idx_order_approvers_office_id ON order_approvers(office_id);
CREATE INDEX IF NOT EXISTS idx_order_approvers_department_id ON order_approvers(department_id);
CREATE INDEX IF NOT EXISTS idx_order_approvers_is_active ON order_approvers(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_approvers_unique_scope
  ON order_approvers(
    user_id,
    approval_queue,
    approval_scope,
    IFNULL(office_id, -1),
    IFNULL(department_id, -1)
);

CREATE INDEX IF NOT EXISTS idx_orders_order_name ON orders(order_name);
CREATE INDEX IF NOT EXISTS idx_orders_request_number ON orders(request_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user);
CREATE INDEX IF NOT EXISTS idx_orders_office_id ON orders(office_id);
CREATE INDEX IF NOT EXISTS idx_orders_department_id ON orders(department_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_approval_target ON orders(approval_target);
CREATE INDEX IF NOT EXISTS idx_orders_expected_arrival_at ON orders(expected_arrival_at);
CREATE INDEX IF NOT EXISTS idx_orders_currency_code ON orders(currency_code);

CREATE INDEX IF NOT EXISTS idx_order_approval_steps_order_id ON order_approval_steps(order_id);
CREATE INDEX IF NOT EXISTS idx_order_approval_steps_queue ON order_approval_steps(approval_queue);
CREATE INDEX IF NOT EXISTS idx_order_approval_steps_status ON order_approval_steps(status);
CREATE INDEX IF NOT EXISTS idx_order_approval_steps_acted_by_user_id ON order_approval_steps(acted_by_user_id);

CREATE INDEX IF NOT EXISTS idx_catalog_categories_status ON catalog_categories(status);
CREATE INDEX IF NOT EXISTS idx_catalog_categories_source ON catalog_categories(source);
CREATE INDEX IF NOT EXISTS idx_catalog_category_aliases_category_id ON catalog_category_aliases(category_id);

CREATE INDEX IF NOT EXISTS idx_catalog_item_types_status ON catalog_item_types(status);
CREATE INDEX IF NOT EXISTS idx_catalog_item_types_source ON catalog_item_types(source);
CREATE INDEX IF NOT EXISTS idx_catalog_products_item_type_id ON catalog_products(item_type_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_product_code ON catalog_products(product_code);
CREATE INDEX IF NOT EXISTS idx_catalog_products_default_currency_code ON catalog_products(default_currency_code);
CREATE INDEX IF NOT EXISTS idx_catalog_products_status ON catalog_products(status);
CREATE INDEX IF NOT EXISTS idx_catalog_products_source ON catalog_products(source);
CREATE INDEX IF NOT EXISTS idx_catalog_type_aliases_item_type_id ON catalog_type_aliases(item_type_id);

CREATE INDEX IF NOT EXISTS idx_catalog_attribute_definitions_status ON catalog_attribute_definitions(status);
CREATE INDEX IF NOT EXISTS idx_catalog_attribute_definitions_source ON catalog_attribute_definitions(source);
CREATE INDEX IF NOT EXISTS idx_catalog_attribute_aliases_attribute_definition_id
  ON catalog_attribute_aliases(attribute_definition_id);
CREATE INDEX IF NOT EXISTS idx_catalog_product_images_product_id ON catalog_product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_catalog_product_images_sort_order ON catalog_product_images(sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS catalog_product_attributes_product_id_attribute_name_normalized_unique
  ON catalog_product_attributes(product_id, lower(attribute_name));
CREATE INDEX IF NOT EXISTS idx_catalog_product_attributes_product_id ON catalog_product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_catalog_product_attributes_catalog_attribute_definition_id
  ON catalog_product_attributes(catalog_attribute_definition_id);
CREATE INDEX IF NOT EXISTS idx_catalog_product_attributes_sort_order
  ON catalog_product_attributes(sort_order);
CREATE INDEX IF NOT EXISTS idx_catalog_product_attributes_name_value
  ON catalog_product_attributes(attribute_name, attribute_value);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_code ON order_items(item_code);
CREATE INDEX IF NOT EXISTS idx_order_items_category ON order_items(category);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);
CREATE INDEX IF NOT EXISTS idx_order_items_catalog_category_id ON order_items(catalog_category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_catalog_item_type_id ON order_items(catalog_item_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_catalog_product_id ON order_items(catalog_product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_currency_code ON order_items(currency_code);

CREATE INDEX IF NOT EXISTS idx_order_item_images_order_item_id ON order_item_images(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_images_sort_order ON order_item_images(sort_order);

CREATE INDEX IF NOT EXISTS idx_order_item_attributes_order_item_id ON order_item_attributes(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_attributes_catalog_attribute_definition_id
  ON order_item_attributes(catalog_attribute_definition_id);
CREATE INDEX IF NOT EXISTS idx_order_item_attributes_name_value
  ON order_item_attributes(attribute_name, attribute_value);

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
CREATE INDEX IF NOT EXISTS idx_assets_item_type ON assets(item_type);
CREATE INDEX IF NOT EXISTS idx_assets_catalog_item_type_id ON assets(catalog_item_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_catalog_product_id ON assets(catalog_product_id);
CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON assets(serial_number);

CREATE INDEX IF NOT EXISTS idx_asset_attributes_asset_id ON asset_attributes(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_attributes_catalog_attribute_definition_id
  ON asset_attributes(catalog_attribute_definition_id);
CREATE INDEX IF NOT EXISTS idx_asset_attributes_name_value
  ON asset_attributes(attribute_name, attribute_value);

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
