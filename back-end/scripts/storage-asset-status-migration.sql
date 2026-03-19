PRAGMA foreign_keys = OFF;

CREATE TABLE receive_items__new (
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
      'missing',
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

INSERT INTO receive_items__new (
  id,
  receive_id,
  order_item_id,
  quantity_received,
  condition_status,
  note,
  created_at,
  updated_at
)
SELECT
  id,
  receive_id,
  order_item_id,
  quantity_received,
  condition_status,
  note,
  created_at,
  updated_at
FROM receive_items;

DROP TABLE receive_items;
ALTER TABLE receive_items__new RENAME TO receive_items;

CREATE INDEX idx_receive_items_receive_id ON receive_items(receive_id);
CREATE INDEX idx_receive_items_order_item_id ON receive_items(order_item_id);
CREATE INDEX idx_receive_items_condition_status ON receive_items(condition_status);

CREATE TABLE assets__new (
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
      'missing',
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
      'pendingRetrieval',
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

INSERT INTO assets__new (
  id,
  receive_item_id,
  asset_code,
  qr_code,
  asset_name,
  category,
  item_type,
  catalog_item_type_id,
  catalog_product_id,
  serial_number,
  condition_status,
  asset_status,
  current_storage_id,
  created_at,
  updated_at
)
SELECT
  id,
  receive_item_id,
  asset_code,
  qr_code,
  asset_name,
  category,
  item_type,
  catalog_item_type_id,
  catalog_product_id,
  serial_number,
  condition_status,
  asset_status,
  current_storage_id,
  created_at,
  updated_at
FROM assets;

DROP TABLE assets;
ALTER TABLE assets__new RENAME TO assets;

CREATE UNIQUE INDEX assets_asset_code_unique ON assets(asset_code);
CREATE UNIQUE INDEX assets_qr_code_unique ON assets(qr_code);
CREATE INDEX idx_assets_receive_item_id ON assets(receive_item_id);
CREATE INDEX idx_assets_current_storage_id ON assets(current_storage_id);
CREATE INDEX idx_assets_asset_status ON assets(asset_status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_item_type ON assets(item_type);
CREATE INDEX idx_assets_catalog_item_type_id ON assets(catalog_item_type_id);
CREATE INDEX idx_assets_catalog_product_id ON assets(catalog_product_id);
CREATE INDEX idx_assets_serial_number ON assets(serial_number);

WITH ranked_assets AS (
  SELECT
    assets.id,
    CASE
      WHEN lower(assets.asset_name) LIKE '%mac%' THEN 'MAC'
      WHEN lower(assets.asset_name) LIKE '%monitor%' THEN 'MON'
      WHEN lower(assets.asset_name) LIKE '%keyboard%' THEN 'KEY'
      WHEN lower(assets.asset_name) LIKE '%dock%' THEN 'DOC'
      WHEN lower(assets.asset_name) LIKE '%printer%' THEN 'PRI'
      WHEN lower(assets.asset_name) LIKE '%router%' THEN 'ROU'
      WHEN lower(assets.asset_name) LIKE '%switch%' THEN 'SWT'
      ELSE COALESCE(
        NULLIF(
          substr(
            upper(
              replace(
                replace(
                  replace(trim(assets.asset_name), ' ', ''),
                  '-',
                  ''
                ),
                '_',
                ''
              )
            ),
            1,
            3
          ),
          ''
        ),
        'AST'
      )
    END AS prefix,
    COALESCE(
      strftime('%Y', receives.received_at),
      strftime('%Y', assets.created_at),
      strftime('%Y', 'now')
    ) AS asset_year
  FROM assets
  LEFT JOIN receive_items ON receive_items.id = assets.receive_item_id
  LEFT JOIN receives ON receives.id = receive_items.receive_id
),
sequenced_assets AS (
  SELECT
    id,
    prefix,
    asset_year,
    ROW_NUMBER() OVER (
      PARTITION BY prefix, asset_year
      ORDER BY id
    ) AS sequence_number
  FROM ranked_assets
)
UPDATE assets
SET asset_code = (
  SELECT
    prefix || '-' || asset_year || '-' || printf('%03d', sequence_number)
  FROM sequenced_assets
  WHERE sequenced_assets.id = assets.id
)
WHERE id IN (SELECT id FROM sequenced_assets);

PRAGMA foreign_keys = ON;
