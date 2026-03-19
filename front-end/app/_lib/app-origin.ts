function ensureOriginProtocol(value: string) {
  const trimmedValue = value.trim().replace(/\/$/, "");

  if (!trimmedValue) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function resolveAppOrigin(explicitOrigin?: string | null) {
  const directOrigin = ensureOriginProtocol(explicitOrigin ?? "");
  if (directOrigin) {
    return directOrigin;
  }

  const envConfiguredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const configuredOrigin = ensureOriginProtocol(
    envConfiguredOrigin,
  );

  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
