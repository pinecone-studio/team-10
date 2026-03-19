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

async function executeMany(statements) {
  for (const statement of statements) {
    await execute(statement);
  }
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

async function ensureNamuunEmail() {
  const [namuun] = await execute(
    "SELECT id, email FROM users WHERE lower(full_name) = 'namuun' LIMIT 1",
  );

  if (!namuun?.id) {
    console.log("skip users.namuun_email (Namuun not found)");
    return;
  }

  if (String(namuun.email || "").toLowerCase() === "tsatskanaraa@gmail.com") {
    console.log("skip users.namuun_email");
    return;
  }

  await execute(
    "UPDATE users SET email = 'tsatskanaraa@gmail.com', updated_at = CURRENT_TIMESTAMP WHERE id = " +
      Number(namuun.id),
  );
  console.log("updated users.namuun_email");
}

async function ensureAssetAssignmentAcknowledgmentsTable() {
  await executeMany([
    `CREATE TABLE IF NOT EXISTS asset_assignment_acknowledgments (
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
    )`,
    "CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_assignment_request_id ON asset_assignment_acknowledgments(assignment_request_id)",
    "CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_asset_id ON asset_assignment_acknowledgments(asset_id)",
    "CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_employee_id ON asset_assignment_acknowledgments(employee_id)",
    "CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_jwt_id ON asset_assignment_acknowledgments(jwt_id)",
    "CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_status ON asset_assignment_acknowledgments(status)",
    "CREATE INDEX IF NOT EXISTS idx_asset_assignment_acknowledgments_email_status ON asset_assignment_acknowledgments(email_status)",
  ]);
  console.log("ensured asset_assignment_acknowledgments table");
}

async function normalizeEmployeeStorageLocations() {
  const [existingCanonicalStorage] = await execute(
    "SELECT id FROM storage WHERE storage_name = 'Main warehouse / Intake' LIMIT 1",
  );

  let canonicalStorageId = Number(existingCanonicalStorage?.id ?? 0);

  if (!canonicalStorageId) {
    await execute(
      "INSERT INTO storage (storage_name, storage_type, description, created_at, updated_at) VALUES ('Main warehouse / Intake', 'warehouse', 'Auto-created canonical intake location', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    );

    const [createdCanonicalStorage] = await execute(
      "SELECT id FROM storage WHERE storage_name = 'Main warehouse / Intake' LIMIT 1",
    );

    canonicalStorageId = Number(createdCanonicalStorage?.id ?? 0);
    if (!canonicalStorageId) {
      throw new Error("Failed to create canonical intake storage location.");
    }
    console.log("created storage.main_warehouse_intake");
  } else {
    console.log("skip storage.main_warehouse_intake");
  }

  const [beforeCleanup] = await execute(
    "SELECT COUNT(*) AS count FROM assets a INNER JOIN storage s ON s.id = a.current_storage_id WHERE s.storage_name LIKE 'Employee / %'",
  );
  const beforeCount = Number(beforeCleanup?.count ?? 0);

  if (beforeCount === 0) {
    console.log("skip assets.employee_location_cleanup");
  } else {
    await execute(
      `UPDATE assets
       SET current_storage_id = ${canonicalStorageId},
           updated_at = CURRENT_TIMESTAMP
       WHERE current_storage_id IN (
         SELECT id
         FROM storage
         WHERE storage_name LIKE 'Employee / %'
       )`,
    );

    const [afterCleanup] = await execute(
      "SELECT COUNT(*) AS count FROM assets a INNER JOIN storage s ON s.id = a.current_storage_id WHERE s.storage_name LIKE 'Employee / %'",
    );
    const afterCount = Number(afterCleanup?.count ?? 0);
    console.log(
      `updated assets.employee_location_cleanup (${beforeCount} -> ${afterCount})`,
    );
  }

  await execute(
    "DELETE FROM storage WHERE storage_name LIKE 'Employee / %' AND id NOT IN (SELECT DISTINCT current_storage_id FROM assets WHERE current_storage_id IS NOT NULL)",
  );

  const [remainingEmployeeNamedLocations] = await execute(
    "SELECT COUNT(*) AS count FROM storage WHERE storage_name LIKE 'Employee / %'",
  );
  const remainingCount = Number(remainingEmployeeNamedLocations?.count ?? 0);
  if (remainingCount === 0) {
    console.log("deleted storage.employee_named_locations");
  } else {
    console.log(
      `skip storage.employee_named_locations (${remainingCount} row(s) still referenced)`,
    );
  }
}

async function run() {
  console.log("Applying safe remote migrations...");
  await ensureAssetAssignmentAcknowledgmentsTable();

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
  await normalizeEmployeeStorageLocations();
  await ensureNamuunEmail();

  console.log("Safe remote migrations completed.");
}

await run();
