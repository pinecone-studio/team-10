const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
const apiToken =
  process.env.CLOUDFLARE_D1_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !databaseId || !apiToken) {
  throw new Error(
    "Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, or Cloudflare API token.",
  );
}

const queryUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

async function execute(sql) {
  const response = await fetch(queryUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params: [] }),
  });
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(JSON.stringify(payload));
  }

  return payload.result?.[0]?.results ?? [];
}

async function columnExists(tableName, columnName) {
  const rows = await execute(`PRAGMA table_info(${tableName})`);
  return rows.some((row) => row.name === columnName);
}

async function tableExists(tableName) {
  const rows = await execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
  );
  return rows.length > 0;
}

async function applyAddColumn(tableName, columnName, sql) {
  if (!(await tableExists(tableName))) {
    console.log(`skip ${tableName}.${columnName} (table missing)`);
    return;
  }

  if (await columnExists(tableName, columnName)) {
    console.log(`skip ${tableName}.${columnName}`);
    return;
  }

  await execute(sql);
  console.log(`added ${tableName}.${columnName}`);
}

async function run() {
  console.log("Applying safe remote migrations...");

  await applyAddColumn(
    "orders",
    "request_number",
    "ALTER TABLE orders ADD COLUMN request_number TEXT",
  );
  await applyAddColumn(
    "orders",
    "request_date",
    "ALTER TABLE orders ADD COLUMN request_date TEXT",
  );
  await applyAddColumn(
    "orders",
    "requester_name",
    "ALTER TABLE orders ADD COLUMN requester_name TEXT",
  );
  await applyAddColumn(
    "orders",
    "user",
    "ALTER TABLE orders ADD COLUMN user INTEGER",
  );
  await applyAddColumn(
    "orders",
    "office_id",
    "ALTER TABLE orders ADD COLUMN office_id INTEGER",
  );
  await applyAddColumn(
    "orders",
    "department_id",
    "ALTER TABLE orders ADD COLUMN department_id INTEGER",
  );
  await applyAddColumn(
    "orders",
    "why_ordered",
    "ALTER TABLE orders ADD COLUMN why_ordered TEXT NOT NULL DEFAULT ''",
  );
  await applyAddColumn(
    "orders",
    "status",
    "ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pendingFinanceApproval'",
  );
  await applyAddColumn(
    "orders",
    "approval_target",
    "ALTER TABLE orders ADD COLUMN approval_target TEXT NOT NULL DEFAULT 'finance'",
  );
  await applyAddColumn(
    "orders",
    "expected_arrival_at",
    "ALTER TABLE orders ADD COLUMN expected_arrival_at TEXT",
  );
  await applyAddColumn(
    "orders",
    "total_cost",
    "ALTER TABLE orders ADD COLUMN total_cost REAL",
  );
  await applyAddColumn(
    "orders",
    "currency_code",
    "ALTER TABLE orders ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'USD'",
  );
  await applyAddColumn(
    "orders",
    "requested_approver_id",
    "ALTER TABLE orders ADD COLUMN requested_approver_id TEXT",
  );
  await applyAddColumn(
    "orders",
    "requested_approver_name",
    "ALTER TABLE orders ADD COLUMN requested_approver_name TEXT",
  );
  await applyAddColumn(
    "orders",
    "requested_approver_role",
    "ALTER TABLE orders ADD COLUMN requested_approver_role TEXT",
  );
  await applyAddColumn(
    "orders",
    "approval_message",
    "ALTER TABLE orders ADD COLUMN approval_message TEXT",
  );
  await applyAddColumn(
    "orders",
    "higher_up_reviewer",
    "ALTER TABLE orders ADD COLUMN higher_up_reviewer TEXT",
  );
  await applyAddColumn(
    "orders",
    "higher_up_reviewed_at",
    "ALTER TABLE orders ADD COLUMN higher_up_reviewed_at TEXT",
  );
  await applyAddColumn(
    "orders",
    "higher_up_note",
    "ALTER TABLE orders ADD COLUMN higher_up_note TEXT",
  );
  await applyAddColumn(
    "orders",
    "finance_reviewer",
    "ALTER TABLE orders ADD COLUMN finance_reviewer TEXT",
  );
  await applyAddColumn(
    "orders",
    "finance_reviewed_at",
    "ALTER TABLE orders ADD COLUMN finance_reviewed_at TEXT",
  );
  await applyAddColumn(
    "orders",
    "finance_note",
    "ALTER TABLE orders ADD COLUMN finance_note TEXT",
  );
  await applyAddColumn(
    "orders",
    "received_at",
    "ALTER TABLE orders ADD COLUMN received_at TEXT",
  );
  await applyAddColumn(
    "orders",
    "received_condition",
    "ALTER TABLE orders ADD COLUMN received_condition TEXT",
  );
  await applyAddColumn(
    "orders",
    "received_note",
    "ALTER TABLE orders ADD COLUMN received_note TEXT",
  );
  await applyAddColumn(
    "orders",
    "storage_location",
    "ALTER TABLE orders ADD COLUMN storage_location TEXT",
  );
  await applyAddColumn(
    "orders",
    "serial_numbers_json",
    "ALTER TABLE orders ADD COLUMN serial_numbers_json TEXT",
  );
  await applyAddColumn(
    "orders",
    "assigned_to",
    "ALTER TABLE orders ADD COLUMN assigned_to TEXT",
  );
  await applyAddColumn(
    "orders",
    "assigned_role",
    "ALTER TABLE orders ADD COLUMN assigned_role TEXT",
  );
  await applyAddColumn(
    "orders",
    "assigned_at",
    "ALTER TABLE orders ADD COLUMN assigned_at TEXT",
  );
  await applyAddColumn(
    "orders",
    "created_at",
    "ALTER TABLE orders ADD COLUMN created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
  );
  await applyAddColumn(
    "orders",
    "updated_at",
    "ALTER TABLE orders ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
  );

  await applyAddColumn(
    "order_items",
    "item_name",
    "ALTER TABLE order_items ADD COLUMN item_name TEXT NOT NULL DEFAULT 'Order item'",
  );
  await applyAddColumn(
    "order_items",
    "item_code",
    "ALTER TABLE order_items ADD COLUMN item_code TEXT NOT NULL DEFAULT 'ITEM'",
  );
  await applyAddColumn(
    "order_items",
    "category",
    "ALTER TABLE order_items ADD COLUMN category TEXT NOT NULL DEFAULT 'General'",
  );
  await applyAddColumn(
    "order_items",
    "item_type",
    "ALTER TABLE order_items ADD COLUMN item_type TEXT NOT NULL DEFAULT 'General'",
  );
  await applyAddColumn(
    "order_items",
    "unit",
    "ALTER TABLE order_items ADD COLUMN unit TEXT NOT NULL DEFAULT 'pcs'",
  );
  await applyAddColumn(
    "order_items",
    "catalog_category_id",
    "ALTER TABLE order_items ADD COLUMN catalog_category_id INTEGER",
  );
  await applyAddColumn(
    "order_items",
    "catalog_item_type_id",
    "ALTER TABLE order_items ADD COLUMN catalog_item_type_id INTEGER",
  );
  await applyAddColumn(
    "order_items",
    "catalog_product_id",
    "ALTER TABLE order_items ADD COLUMN catalog_product_id INTEGER",
  );
  await applyAddColumn(
    "order_items",
    "unit_cost",
    "ALTER TABLE order_items ADD COLUMN unit_cost REAL NOT NULL DEFAULT 0",
  );
  await applyAddColumn(
    "order_items",
    "currency_code",
    "ALTER TABLE order_items ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'USD'",
  );
  await applyAddColumn(
    "order_items",
    "from_where",
    "ALTER TABLE order_items ADD COLUMN from_where TEXT NOT NULL DEFAULT 'catalog'",
  );
  await applyAddColumn(
    "order_items",
    "additional_notes",
    "ALTER TABLE order_items ADD COLUMN additional_notes TEXT",
  );
  await applyAddColumn(
    "order_items",
    "eta",
    "ALTER TABLE order_items ADD COLUMN eta TEXT",
  );
  await applyAddColumn(
    "order_items",
    "created_at",
    "ALTER TABLE order_items ADD COLUMN created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
  );
  await applyAddColumn(
    "order_items",
    "updated_at",
    "ALTER TABLE order_items ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
  );

  await applyAddColumn(
    "asset_distributions",
    "recipient_role",
    "ALTER TABLE asset_distributions ADD COLUMN recipient_role TEXT",
  );
  await applyAddColumn(
    "asset_distributions",
    "usage_years",
    "ALTER TABLE asset_distributions ADD COLUMN usage_years TEXT",
  );
  await applyAddColumn(
    "asset_distributions",
    "return_condition",
    "ALTER TABLE asset_distributions ADD COLUMN return_condition TEXT",
  );
  await applyAddColumn(
    "asset_distributions",
    "return_power",
    "ALTER TABLE asset_distributions ADD COLUMN return_power TEXT",
  );

  console.log("Safe remote migrations completed.");
}

await run();
