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
const dummyAssetMatchSql = `
  SELECT a.id
  FROM assets a
  LEFT JOIN receive_items ri ON ri.id = a.receive_item_id
  LEFT JOIN receives r ON r.id = ri.receive_id
  LEFT JOIN users u ON u.id = r.received_by_user_id
  WHERE a.asset_code LIKE ?
     OR a.serial_number LIKE ?
     OR lower(coalesce(u.email, ?)) LIKE ?
`;

async function execute(sql, params = []) {
  const response = await fetch(queryUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(JSON.stringify(payload));
  }

  return payload.result?.[0]?.results ?? [];
}

async function countDummyAssets() {
  const [row] = await execute(
    `
      SELECT COUNT(*) AS count
      FROM assets a
      LEFT JOIN receive_items ri ON ri.id = a.receive_item_id
      LEFT JOIN receives r ON r.id = ri.receive_id
      LEFT JOIN users u ON u.id = r.received_by_user_id
      WHERE a.asset_code LIKE ?
         OR a.serial_number LIKE ?
         OR lower(coalesce(u.email, ?)) LIKE ?
    `,
    ["DMY-%", "SN-DMY-%", "missing", "demo-user-%@example.local"],
  );

  return Number(row?.count ?? 0);
}

async function run() {
  const beforeCount = await countDummyAssets();
  console.log(`dummy assets before cleanup: ${beforeCount}`);

  if (beforeCount === 0) {
    return;
  }

  const matchParams = ["DMY-%", "SN-DMY-%", "missing", "demo-user-%@example.local"];

  await execute(
    `DELETE FROM asset_distributions WHERE asset_id IN (${dummyAssetMatchSql})`,
    matchParams,
  );
  await execute(
    `DELETE FROM asset_disposals WHERE asset_id IN (${dummyAssetMatchSql})`,
    matchParams,
  );
  await execute(
    `DELETE FROM asset_assignment_acknowledgments WHERE asset_id IN (${dummyAssetMatchSql})`,
    matchParams,
  );
  await execute(
    `DELETE FROM asset_assignment_requests WHERE asset_id IN (${dummyAssetMatchSql})`,
    matchParams,
  );
  await execute(
    `DELETE FROM asset_attributes WHERE asset_id IN (${dummyAssetMatchSql})`,
    matchParams,
  );
  await execute(
    `DELETE FROM audit_logs
     WHERE entity_type = ?
       AND CAST(entity_id AS INTEGER) IN (${dummyAssetMatchSql})`,
    ["asset", ...matchParams],
  );
  await execute(
    `DELETE FROM assets WHERE id IN (${dummyAssetMatchSql})`,
    matchParams,
  );

  const afterCount = await countDummyAssets();
  console.log(`dummy assets after cleanup: ${afterCount}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
