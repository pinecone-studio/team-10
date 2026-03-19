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
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}'`,
  );
  return rows.length > 0;
}

async function indexExists(indexName) {
  const rows = await execute(
    `SELECT name FROM sqlite_master WHERE type = 'index' AND name = '${indexName}'`,
  );
  return rows.length > 0;
}

async function applyAddColumn(tableName, columnName, sql) {
  if (await columnExists(tableName, columnName)) {
    console.log(`skip ${tableName}.${columnName}`);
    return;
  }

  await execute(sql);
  console.log(`added ${tableName}.${columnName}`);
}

async function applyCreateTable(tableName, sql) {
  if (await tableExists(tableName)) {
    console.log(`skip table ${tableName}`);
    return;
  }

  await execute(sql);
  console.log(`created table ${tableName}`);
}

async function applyCreateIndex(indexName, sql) {
  if (await indexExists(indexName)) {
    console.log(`skip index ${indexName}`);
    return;
  }

  await execute(sql);
  console.log(`created index ${indexName}`);
}

async function run() {
  console.log("Applying safe remote migrations...");

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
  await applyCreateTable(
    "census_sessions",
    `CREATE TABLE census_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      scope_type TEXT NOT NULL CHECK (scope_type IN ('company', 'department', 'category')),
      scope_value TEXT,
      created_by_user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
      due_at TEXT NOT NULL,
      completed_at TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by_user_id) REFERENCES users(id)
    )`,
  );
  await applyCreateTable(
    "census_tasks",
    `CREATE TABLE census_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      census_session_id INTEGER NOT NULL,
      asset_id INTEGER NOT NULL,
      distribution_id INTEGER,
      employee_id INTEGER NOT NULL,
      baseline_condition_status TEXT NOT NULL CHECK (baseline_condition_status IN ('good', 'fair', 'damaged', 'defective', 'missing', 'incomplete', 'used')),
      baseline_asset_status TEXT NOT NULL CHECK (baseline_asset_status IN ('received', 'inStorage', 'available', 'pendingAssignment', 'assigned', 'pendingRetrieval', 'inRepair', 'pendingDisposal', 'sold', 'disposed', 'lost')),
      baseline_location TEXT,
      reported_condition_status TEXT CHECK (reported_condition_status IS NULL OR reported_condition_status IN ('good', 'fair', 'damaged', 'defective', 'missing', 'incomplete', 'used')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'discrepancy')),
      verification_channel TEXT CHECK (verification_channel IS NULL OR verification_channel IN ('auditorQr', 'employeePortal', 'manual')),
      verified_at TEXT,
      verified_by_user_id INTEGER,
      verified_by_name TEXT,
      note TEXT,
      discrepancy_reason TEXT,
      portal_jwt_id TEXT UNIQUE,
      portal_expires_at TEXT,
      portal_consumed_at TEXT,
      portal_email_status TEXT NOT NULL DEFAULT 'pending' CHECK (portal_email_status IN ('pending', 'sent', 'failed', 'skipped')),
      portal_email_sent_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (census_session_id) REFERENCES census_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
      FOREIGN KEY (distribution_id) REFERENCES asset_distributions(id) ON DELETE SET NULL,
      FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
  );
  await applyCreateIndex(
    "idx_census_sessions_status",
    "CREATE INDEX idx_census_sessions_status ON census_sessions(status)",
  );
  await applyCreateIndex(
    "idx_census_sessions_scope",
    "CREATE INDEX idx_census_sessions_scope ON census_sessions(scope_type, scope_value)",
  );
  await applyCreateIndex(
    "idx_census_sessions_due_at",
    "CREATE INDEX idx_census_sessions_due_at ON census_sessions(due_at)",
  );
  await applyCreateIndex(
    "idx_census_tasks_session_id",
    "CREATE INDEX idx_census_tasks_session_id ON census_tasks(census_session_id)",
  );
  await applyCreateIndex(
    "idx_census_tasks_asset_id",
    "CREATE INDEX idx_census_tasks_asset_id ON census_tasks(asset_id)",
  );
  await applyCreateIndex(
    "idx_census_tasks_distribution_id",
    "CREATE INDEX idx_census_tasks_distribution_id ON census_tasks(distribution_id)",
  );
  await applyCreateIndex(
    "idx_census_tasks_employee_id",
    "CREATE INDEX idx_census_tasks_employee_id ON census_tasks(employee_id)",
  );
  await applyCreateIndex(
    "idx_census_tasks_status",
    "CREATE INDEX idx_census_tasks_status ON census_tasks(status)",
  );
  await applyCreateIndex(
    "idx_census_tasks_portal_jwt_id",
    "CREATE INDEX idx_census_tasks_portal_jwt_id ON census_tasks(portal_jwt_id)",
  );

  console.log("Safe remote migrations completed.");
}

await run();
