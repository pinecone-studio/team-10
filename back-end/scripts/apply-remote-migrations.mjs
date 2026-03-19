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

async function applyAddColumn(tableName, columnName, sql) {
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
  await applyAddColumn(
    "assets",
    "asset_image_object_key",
    "ALTER TABLE assets ADD COLUMN asset_image_object_key TEXT",
  );
  await applyAddColumn(
    "assets",
    "asset_image_file_name",
    "ALTER TABLE assets ADD COLUMN asset_image_file_name TEXT",
  );
  await applyAddColumn(
    "assets",
    "asset_image_content_type",
    "ALTER TABLE assets ADD COLUMN asset_image_content_type TEXT",
  );

  console.log("Safe remote migrations completed.");
}

await run();
