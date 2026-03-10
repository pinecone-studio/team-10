PRAGMA defer_foreign_keys=TRUE;

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  why_ordered TEXT NOT NULL,
  who_approved TEXT NOT NULL,
  order_process TEXT NOT NULL,
  which_office TEXT NOT NULL,
  when_to_arrive TEXT,
  total_cost REAL NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_cost REAL NOT NULL CHECK (unit_cost >= 0),
  from_where TEXT NOT NULL,
  additional_notes TEXT,
  eta TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

DELETE FROM sqlite_sequence;

CREATE INDEX idx_orders_which_office ON orders(which_office);
CREATE INDEX idx_orders_when_to_arrive ON orders(when_to_arrive);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_category ON order_items(category);
