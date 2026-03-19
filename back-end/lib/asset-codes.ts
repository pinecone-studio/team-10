function sanitizePrefixSource(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export function createAssetPrefix(assetName: string) {
  const normalized = assetName.trim().toLowerCase();

  if (normalized.includes("mac")) return "MAC";
  if (normalized.includes("monitor")) return "MON";
  if (normalized.includes("keyboard")) return "KEY";
  if (normalized.includes("dock")) return "DOC";
  if (normalized.includes("printer")) return "PRI";
  if (normalized.includes("router")) return "ROU";
  if (normalized.includes("switch")) return "SWT";

  const fallback = sanitizePrefixSource(normalized).slice(0, 3);
  return fallback || "AST";
}

export function getAssetCodeYear(receivedAt: string) {
  const parsedYear = new Date(receivedAt).getFullYear();
  return Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
}

export function buildAssetCode(assetName: string, receivedAt: string, sequence: number) {
  const year = getAssetCodeYear(receivedAt);
  return `${createAssetPrefix(assetName)}-${year}-${String(sequence).padStart(3, "0")}`;
}

export function extractAssetCodeSequence(assetCode: string) {
  const parts = assetCode.split("-");
  const sequence = Number(parts.at(-1));
  return Number.isInteger(sequence) && sequence > 0 ? sequence : 0;
}
