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

async function applyAddColumn(tableName, columnName, sql) {
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

async function run() {
  console.log("Applying safe remote migrations...");
  await ensureAssetAssignmentAcknowledgmentsTable();

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
  await ensureNamuunEmail();

  console.log("Safe remote migrations completed.");
}

await run();
