import { timingSafeEqual } from "node:crypto";

type JwtPayload = Record<string, unknown> & {
  exp?: number;
  iat?: number;
};

function toBase64Url(input: string | Uint8Array) {
  const buffer =
    typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);

  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return Buffer.from(padded, "base64");
}

async function createHmacSha256(input: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    Buffer.from(secret, "utf8"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    Buffer.from(input, "utf8"),
  );

  return new Uint8Array(signature);
}

export async function createSignedJwt(
  payload: JwtPayload,
  secret: string,
) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const content = `${encodedHeader}.${encodedPayload}`;
  const signature = await createHmacSha256(content, secret);

  return `${content}.${toBase64Url(signature)}`;
}

export async function verifySignedJwt<TPayload extends JwtPayload>(
  token: string,
  secret: string,
): Promise<TPayload> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("JWT token is malformed.");
  }

  const content = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = await createHmacSha256(content, secret);
  const providedSignature = fromBase64Url(encodedSignature);

  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(Buffer.from(expectedSignature), providedSignature)
  ) {
    throw new Error("JWT signature is invalid.");
  }

  const payload = JSON.parse(
    fromBase64Url(encodedPayload).toString("utf8"),
  ) as TPayload;

  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    throw new Error("JWT token has expired.");
  }

  return payload;
}
