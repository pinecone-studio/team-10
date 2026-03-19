import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { RuntimeConfig } from "./context.ts";

type AssetImageUploadInput = {
  assetCode: string;
  fileName?: string | null;
  dataUrl: string;
};

type ParsedDataUrl = {
  contentType: string;
  bytes: Uint8Array;
};

function assertR2Config(runtimeConfig: RuntimeConfig) {
  if (
    !runtimeConfig.r2AccountId ||
    !runtimeConfig.r2AccessKeyId ||
    !runtimeConfig.r2SecretAccessKey ||
    !runtimeConfig.r2BucketName
  ) {
    throw new Error(
      "Cloudflare R2 is not configured. Set CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET_NAME.",
    );
  }
}

function createR2Client(runtimeConfig: RuntimeConfig) {
  assertR2Config(runtimeConfig);

  return new S3Client({
    region: "auto",
    endpoint: `https://${runtimeConfig.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: runtimeConfig.r2AccessKeyId!,
      secretAccessKey: runtimeConfig.r2SecretAccessKey!,
    },
  });
}

function parseDataUrl(dataUrl: string): ParsedDataUrl {
  const trimmed = dataUrl.trim();
  const match = /^data:([^;]+);base64,(.+)$/i.exec(trimmed);

  if (!match) {
    throw new Error("Asset image must be a valid base64 data URL.");
  }

  const [, contentType, base64Payload] = match;

  try {
    return {
      contentType,
      bytes: Uint8Array.from(Buffer.from(base64Payload, "base64")),
    };
  } catch {
    throw new Error("Asset image base64 payload could not be decoded.");
  }
}

function buildSafeFileExtension(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "bin";
}

function sanitizeFileStem(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "asset-image";
}

export async function uploadAssetImageToR2(
  runtimeConfig: RuntimeConfig,
  input: AssetImageUploadInput,
) {
  try {
    const parsedImage = parseDataUrl(input.dataUrl);
    const fileExtension = buildSafeFileExtension(parsedImage.contentType);
    const fileStem = sanitizeFileStem(
      input.fileName?.replace(/\.[^.]+$/, "") || input.assetCode,
    );
    const objectKey = `asset-images/${sanitizeFileStem(input.assetCode)}/${Date.now()}-${fileStem}.${fileExtension}`;
    const client = createR2Client(runtimeConfig);

    await client.send(
      new PutObjectCommand({
        Bucket: runtimeConfig.r2BucketName!,
        Key: objectKey,
        Body: parsedImage.bytes,
        ContentType: parsedImage.contentType,
      }),
    );

    return {
      objectKey,
      fileName: input.fileName?.trim() || `${fileStem}.${fileExtension}`,
      contentType: parsedImage.contentType,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown R2 upload error.";
    throw new Error(`Failed to upload asset image to R2: ${message}`);
  }
}

export async function loadAssetImageDataUrlFromR2(
  runtimeConfig: RuntimeConfig,
  objectKey?: string | null,
  contentType?: string | null,
) {
  if (!objectKey) {
    return null;
  }

  try {
    const client = createR2Client(runtimeConfig);
    const response = await client.send(
      new GetObjectCommand({
        Bucket: runtimeConfig.r2BucketName!,
        Key: objectKey,
      }),
    );

    const bytes = await response.Body?.transformToByteArray();
    if (!bytes || bytes.length === 0) {
      return null;
    }

    const resolvedContentType = contentType || response.ContentType || "application/octet-stream";
    return `data:${resolvedContentType};base64,${Buffer.from(bytes).toString("base64")}`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown R2 read error.";
    throw new Error(`Failed to load asset image from R2: ${message}`);
  }
}

export async function deleteAssetImageFromR2(
  runtimeConfig: RuntimeConfig,
  objectKey?: string | null,
) {
  if (!objectKey) {
    return;
  }

  try {
    const client = createR2Client(runtimeConfig);
    await client.send(
      new DeleteObjectCommand({
        Bucket: runtimeConfig.r2BucketName!,
        Key: objectKey,
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown R2 delete error.";
    throw new Error(`Failed to delete asset image from R2: ${message}`);
  }
}
