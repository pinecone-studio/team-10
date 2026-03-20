import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  assetAssignmentAcknowledgments,
  assetAssignmentRequests,
  assetAttributes,
  assetDistributions,
  assets,
  notifications,
  users,
} from "../../database/schema.ts";
import type { RuntimeConfig } from "../context.ts";
import type { AppDb } from "../db.ts";
import { sendOperationalEmail, type EmailDeliveryStatus } from "../email.ts";
import { createSignedJwt, verifySignedJwt } from "../jwt.ts";
import { getDistributionById, type DistributionRecord } from "./shared.ts";

type AssignmentAckJwtPayload = {
  sub: string;
  jti: string;
  ackId: number;
  assignmentRequestId: number;
  employeeId: number;
  iat: number;
  exp: number;
};

type AssignmentAckEmailStatus = "pending" | EmailDeliveryStatus;

type CreateAcknowledgmentInput = {
  assignmentRequestId: number;
  assetId: number;
  assetCode: string;
  assetName: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  recipientRole: string;
};

export type AssignmentAcknowledgmentPreviewRecord = {
  acknowledgmentId: string;
  assignmentRequestId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: string;
  customAttributes: AssignmentAcknowledgmentCustomAttributeRecord[];
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  recipientRole: string;
  expiresAt: string;
  status: string;
  signedAt: string | null;
  tokenConsumedAt: string | null;
};

export type AssignmentAcknowledgmentSignRecord = {
  acknowledgmentId: string;
  pdfObjectKey: string | null;
  pdfFileName: string | null;
  pdfContentType: string;
  pdfBase64: string;
  status: string;
  signedAt: string | null;
  distribution: DistributionRecord;
};

export type AssignmentAcknowledgmentPdfRecord = {
  fileName: string;
  contentType: string;
  base64: string;
};

export type AssignmentAcknowledgmentCustomAttributeRecord = {
  attributeName: string;
  attributeValue: string;
};

export type ResendAssignmentAcknowledgmentEmailResult = {
  resent: boolean;
  emailStatus: AssignmentAckEmailStatus;
  emailError: string | null;
  acknowledgmentUrl: string | null;
  expiresAt: string | null;
};

type PendingAcknowledgmentRow = {
  acknowledgmentId: number;
  assignmentRequestId: number;
  assetId: number;
  assetCode: string;
  assetName: string;
  category: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  recipientRole: string | null;
  jwtId: string;
  expiresAt: string | null;
  status: string | null;
  tokenConsumedAt: string | null;
  signedAt: string | null;
  distributionId: number | null;
  distributionStatus: string | null;
};

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function resolveAcknowledgmentEmployeeName(
  recipientName: string | null | undefined,
  fallbackEmployeeName: string | null | undefined,
) {
  const normalizedRecipient = recipientName?.trim() ?? "";
  if (normalizedRecipient && normalizedRecipient.toLowerCase() !== "employee") {
    return normalizedRecipient;
  }

  const normalizedFallback = fallbackEmployeeName?.trim() ?? "";
  if (normalizedFallback) {
    return normalizedFallback;
  }

  return normalizedRecipient || "Employee";
}

function resolveAcknowledgmentEmployeeEmail(
  recipientEmail: string | null | undefined,
  fallbackEmployeeEmail: string | null | undefined,
) {
  const normalizedRecipient = recipientEmail?.trim() ?? "";
  if (
    normalizedRecipient &&
    normalizedRecipient.includes("@") &&
    !looksLikeUuid(normalizedRecipient)
  ) {
    return normalizedRecipient;
  }

  const normalizedFallback = fallbackEmployeeEmail?.trim() ?? "";
  if (
    normalizedFallback &&
    normalizedFallback.includes("@") &&
    !looksLikeUuid(normalizedFallback)
  ) {
    return normalizedFallback;
  }

  return normalizedRecipient || normalizedFallback || "";
}

function resolvePdfEmployeeFields(input: {
  employeeName: string;
  employeeEmail: string;
}) {
  const normalizedName = input.employeeName.trim();
  const normalizedEmail = input.employeeEmail.trim();
  const nameLooksLikeEmail =
    normalizedName.includes("@") && !looksLikeUuid(normalizedName);
  const emailLooksLikeEmail =
    normalizedEmail.includes("@") && !looksLikeUuid(normalizedEmail);

  if (nameLooksLikeEmail && !emailLooksLikeEmail) {
    return {
      employeeName: normalizedEmail || normalizedName,
      employeeEmail: normalizedName,
    };
  }

  return {
    employeeName: normalizedName || normalizedEmail,
    employeeEmail: normalizedEmail || normalizedName,
  };
}

function normalizeAppUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function buildAcknowledgmentLink(runtimeConfig: RuntimeConfig, token: string) {
  const origin = normalizeAppUrl(runtimeConfig.appUrl || "http://localhost:3000");
  return `${origin}/assignment-acknowledgment?token=${encodeURIComponent(token)}`;
}

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

async function sendAssignmentAcknowledgmentEmail(
  runtimeConfig: RuntimeConfig,
  input: {
    recipientEmail: string;
    recipientName: string;
    assetName: string;
    assetCode: string;
    acknowledgmentUrl: string;
    expiresAt: string;
  },
): Promise<{ status: AssignmentAckEmailStatus; errorMessage: string | null }> {
  const plainText = [
    `Hello ${input.recipientName},`,
    "",
    `You have been assigned an asset: ${input.assetName} (${input.assetCode}).`,
    "Before assignment is confirmed, you must sign the acknowledgment using the secure link below:",
    input.acknowledgmentUrl,
    "",
    `This link expires at ${input.expiresAt} and can only be used once.`,
  ].join("\n");

  const html = `<p>Hello ${input.recipientName},</p><p>You have been assigned an asset: <strong>${input.assetName} (${input.assetCode})</strong>.</p><p>Before assignment is confirmed, you must sign the acknowledgment using this secure link:</p><p><a href="${input.acknowledgmentUrl}">${input.acknowledgmentUrl}</a></p><p>This link expires at ${input.expiresAt} and can only be used once.</p>`;

  return await sendOperationalEmail(runtimeConfig, {
    to: input.recipientEmail,
    subject: "Asset assignment acknowledgment required",
    text: plainText,
    html,
  });
}

async function loadAcknowledgmentByJwtId(db: AppDb, jwtId: string) {
  const [acknowledgment] = await db
    .select({
      acknowledgmentId: assetAssignmentAcknowledgments.id,
      assignmentRequestId: assetAssignmentAcknowledgments.assignmentRequestId,
      assetId: assets.id,
      assetCode: assets.assetCode,
      assetName: assets.assetName,
      category: assets.category,
      employeeId: assetAssignmentAcknowledgments.employeeId,
      recipientName: assetAssignmentAcknowledgments.recipientName,
      recipientEmail: assetAssignmentAcknowledgments.recipientEmail,
      fallbackEmployeeName: users.fullName,
      fallbackEmployeeEmail: users.email,
      recipientRole: assetAssignmentAcknowledgments.recipientRole,
      jwtId: assetAssignmentAcknowledgments.jwtId,
      expiresAt: assetAssignmentAcknowledgments.expiresAt,
      status: assetAssignmentAcknowledgments.status,
      tokenConsumedAt: assetAssignmentAcknowledgments.tokenConsumedAt,
      signedAt: assetAssignmentAcknowledgments.signedAt,
      distributionId: assetDistributions.id,
      distributionStatus: assetDistributions.status,
    })
    .from(assetAssignmentAcknowledgments)
    .innerJoin(
      assets,
      eq(assetAssignmentAcknowledgments.assetId, assets.id),
    )
    .leftJoin(
      users,
      eq(assetAssignmentAcknowledgments.employeeId, users.id),
    )
    .leftJoin(
      assetDistributions,
      eq(
        assetDistributions.assignmentRequestId,
        assetAssignmentAcknowledgments.assignmentRequestId,
      ),
    )
    .where(eq(assetAssignmentAcknowledgments.jwtId, jwtId))
    .limit(1);

  if (!acknowledgment) {
    return undefined;
  }

  const normalizedAcknowledgment = {
    ...acknowledgment,
    employeeName: resolveAcknowledgmentEmployeeName(
      acknowledgment.recipientName,
      acknowledgment.fallbackEmployeeName,
    ),
    employeeEmail: resolveAcknowledgmentEmployeeEmail(
      acknowledgment.recipientEmail,
      acknowledgment.fallbackEmployeeEmail,
    ),
  };

  if (normalizedAcknowledgment.distributionId) {
    return normalizedAcknowledgment as PendingAcknowledgmentRow;
  }

  const [fallbackDistribution] = await db
    .select({
      id: assetDistributions.id,
      status: assetDistributions.status,
    })
    .from(assetDistributions)
    .where(
      and(
        eq(assetDistributions.assetId, normalizedAcknowledgment.assetId),
        eq(assetDistributions.employeeId, normalizedAcknowledgment.employeeId),
      ),
    )
    .orderBy(desc(assetDistributions.distributedAt), desc(assetDistributions.id))
    .limit(1);

  if (!fallbackDistribution) {
    return normalizedAcknowledgment as PendingAcknowledgmentRow;
  }

  return {
    ...normalizedAcknowledgment,
    distributionId: fallbackDistribution.id,
    distributionStatus: fallbackDistribution.status,
  } as PendingAcknowledgmentRow;
}

async function recoverMissingDistributionForAcknowledgment(
  db: AppDb,
  acknowledgment: PendingAcknowledgmentRow,
) {
  const [assignmentRequest] = await db
    .select({
      reviewedByUserId: assetAssignmentRequests.reviewedByUserId,
    })
    .from(assetAssignmentRequests)
    .where(eq(assetAssignmentRequests.id, acknowledgment.assignmentRequestId))
    .limit(1);

  const distributedByUserId =
    assignmentRequest?.reviewedByUserId ?? acknowledgment.employeeId;
  const now = new Date().toISOString();

  await db
    .insert(assetDistributions)
    .values({
      assignmentRequestId: acknowledgment.assignmentRequestId,
      assetId: acknowledgment.assetId,
      employeeId: acknowledgment.employeeId,
      distributedByUserId,
      distributedAt: now,
      recipientRole: acknowledgment.recipientRole ?? "Employee",
      status: "pendingHandover",
      note: "Recovered pending handover distribution from acknowledgment link.",
    })
    .onConflictDoNothing({ target: assetDistributions.assignmentRequestId })
    .run();

  const [distribution] = await db
    .select({
      id: assetDistributions.id,
      status: assetDistributions.status,
    })
    .from(assetDistributions)
    .where(eq(assetDistributions.assignmentRequestId, acknowledgment.assignmentRequestId))
    .orderBy(desc(assetDistributions.id))
    .limit(1);

  return distribution ?? null;
}

async function loadOrRecoverDistributionForAcknowledgment(
  db: AppDb,
  acknowledgment: PendingAcknowledgmentRow,
) {
  if (acknowledgment.distributionId) {
    return {
      id: acknowledgment.distributionId,
      status: acknowledgment.distributionStatus,
    };
  }

  const recovered = await recoverMissingDistributionForAcknowledgment(
    db,
    acknowledgment,
  );

  if (!recovered) {
    return null;
  }

  return recovered;
}

function resolveAcknowledgmentExpiresAt(
  expiresAtFromRecord: string | null | undefined,
  payloadExp: number | undefined,
) {
  const normalizedRecord = expiresAtFromRecord?.trim() ?? "";
  if (normalizedRecord) {
    return normalizedRecord;
  }

  if (typeof payloadExp === "number" && Number.isFinite(payloadExp)) {
    return new Date(payloadExp * 1000).toISOString();
  }

  return new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
}

function resolveAcknowledgmentStatus(input: {
  status: string | null | undefined;
  tokenConsumedAt: string | null;
  signedAt: string | null;
  expiresAt: string;
}) {
  const normalizedStatus = (input.status ?? "").trim().toLowerCase();
  if (["pending", "confirmed", "expired", "void"].includes(normalizedStatus)) {
    return normalizedStatus;
  }

  if (input.tokenConsumedAt || input.signedAt) {
    return "confirmed";
  }

  const expiresAtMs = Date.parse(input.expiresAt);
  if (!Number.isNaN(expiresAtMs) && expiresAtMs <= Date.now()) {
    return "expired";
  }

  return "pending";
}

async function verifyAssignmentAcknowledgmentJwt(
  runtimeConfig: RuntimeConfig,
  token: string,
) {
  const verificationSecrets =
    runtimeConfig.assignmentJwtVerificationSecrets?.length > 0
      ? runtimeConfig.assignmentJwtVerificationSecrets
      : [runtimeConfig.assignmentJwtSecret];
  let lastError: Error | null = null;

  for (const secret of verificationSecrets) {
    try {
      return await verifySignedJwt<AssignmentAckJwtPayload>(token, secret);
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("JWT token verification failed.");
    }
  }

  throw lastError ?? new Error("JWT token verification failed.");
}

function ensurePendingAcknowledgment(
  acknowledgment: PendingAcknowledgmentRow,
  payload: AssignmentAckJwtPayload,
) {
  const normalizeNumericValue = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  };

  const verifyNumericClaim = (
    label: string,
    claimValue: unknown,
    recordValue: unknown,
  ) => {
    const normalizedClaim = normalizeNumericValue(claimValue);
    const normalizedRecord = normalizeNumericValue(recordValue);

    if (normalizedClaim === null || normalizedRecord === null) {
      return;
    }

    if (normalizedClaim !== normalizedRecord) {
      console.warn(
        `Assignment acknowledgment ${label} mismatch for jwtId ${acknowledgment.jwtId}. token=${normalizedClaim}, record=${normalizedRecord}.`,
      );
    }
  };

  if (payload.sub !== "asset-assignment-ack") {
    throw new Error("Assignment acknowledgment token subject is invalid.");
  }

  verifyNumericClaim("ackId", payload.ackId, acknowledgment.acknowledgmentId);
  verifyNumericClaim(
    "assignmentRequestId",
    payload.assignmentRequestId,
    acknowledgment.assignmentRequestId,
  );
  verifyNumericClaim("employeeId", payload.employeeId, acknowledgment.employeeId);

  if (acknowledgment.tokenConsumedAt) {
    throw new Error("This acknowledgment link has already been used.");
  }

  const normalizedStatus = String(acknowledgment.status ?? "")
    .trim()
    .toLowerCase();
  const isPendingStatus =
    normalizedStatus === "pending" ||
    normalizedStatus === "" ||
    normalizedStatus === "null";

  if (!isPendingStatus) {
    throw new Error(
      `Acknowledgment cannot be signed from status '${acknowledgment.status}'.`,
    );
  }

  const parseIsoMs = (value: unknown) => {
    if (typeof value !== "string" || value.trim() === "") {
      return null;
    }

    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  };
  const dbExpiresAtMs = parseIsoMs(acknowledgment.expiresAt);
  const tokenExpiresAtMs =
    typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  const effectiveExpiresAtMs =
    dbExpiresAtMs === null
      ? tokenExpiresAtMs
      : tokenExpiresAtMs === null
        ? dbExpiresAtMs
        : Math.max(dbExpiresAtMs, tokenExpiresAtMs);

  if (effectiveExpiresAtMs !== null && effectiveExpiresAtMs <= Date.now()) {
    throw new Error("This acknowledgment link has expired.");
  }
}

async function renderAcknowledgmentPdf(input: {
  employeeName: string;
  employeeEmail: string;
  recipientRole: string;
  assetName: string;
  assetCode: string;
  category: string;
  customAttributes: AssignmentAcknowledgmentCustomAttributeRecord[];
  signerName: string;
  signatureText: string;
  signedAt: string;
}) {
  const resolvedEmployee = resolvePdfEmployeeFields({
    employeeName: input.employeeName,
    employeeEmail: input.employeeEmail,
  });
  const document = new PDFDocument({
    size: "A4",
    margin: 42,
    info: {
      Title: "Asset Assignment Acknowledgment",
      Author: "AMSS",
      Subject: "Employee asset assignment acknowledgment",
    },
  });

  const chunks: Uint8Array[] = [];
  document.on("data", (chunk) => chunks.push(chunk as Uint8Array));

  document
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#0f172a")
    .text("Asset Assignment Acknowledgment");

  document.moveDown(0.8);
  document
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#334155")
    .text(`Signed at: ${input.signedAt}`);

  document.moveDown(1.2);
  document
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#0f172a")
    .text("Employee");

  document
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#334155")
    .text(`Employee: ${resolvedEmployee.employeeName}`)
    .text(`Email: ${resolvedEmployee.employeeEmail}`)
    .text(`Role: ${input.recipientRole}`);

  document.moveDown(1);
  document
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#0f172a")
    .text("Asset");

  document
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#334155")
    .text(`Asset Name: ${input.assetName}`)
    .text(`Asset Code: ${input.assetCode}`)
    .text(`Asset Category: ${input.category}`);

  if (input.customAttributes.length > 0) {
    document.moveDown(0.5);
    document
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text("Custom Attributes");

    document
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#334155");
    for (const attribute of input.customAttributes) {
      document.text(`${attribute.attributeName}: ${attribute.attributeValue}`);
    }
  }

  document.moveDown(1);
  document
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#0f172a")
    .text("Signature");

  document
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#334155")
    .text(`Signer Name: ${input.signerName}`)
    .text(`Signature Text: ${input.signatureText}`);

  document.moveDown(1.2);
  document
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#475569")
    .text(
      "I acknowledge receipt of the asset listed above and agree to comply with company asset usage policies.",
    );

  document.end();

  return new Promise<Buffer>((resolve, reject) => {
    document.on("end", () =>
      resolve(
        Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
      ),
    );
    document.on("error", reject);
  });
}

async function uploadAcknowledgmentPdfToR2(
  runtimeConfig: RuntimeConfig,
  input: {
    acknowledgmentId: number;
    pdfBuffer: Buffer;
  },
) {
  const client = createR2Client(runtimeConfig);
  const objectKey = `assignment-acknowledgments/${input.acknowledgmentId}/${Date.now()}-signed-acknowledgment.pdf`;

  await client.send(
    new PutObjectCommand({
      Bucket: runtimeConfig.r2BucketName!,
      Key: objectKey,
      Body: input.pdfBuffer,
      ContentType: "application/pdf",
    }),
  );

  return {
    objectKey,
    fileName: `assignment-acknowledgment-${input.acknowledgmentId}.pdf`,
  };
}

async function loadAssetCustomAttributes(
  db: AppDb,
  assetId: number,
): Promise<AssignmentAcknowledgmentCustomAttributeRecord[]> {
  const rows = await db
    .select({
      attributeName: assetAttributes.attributeName,
      attributeValue: assetAttributes.attributeValue,
    })
    .from(assetAttributes)
    .where(eq(assetAttributes.assetId, assetId))
    .orderBy(asc(assetAttributes.attributeName), asc(assetAttributes.id));

  return rows.map((row) => ({
    attributeName: row.attributeName,
    attributeValue: row.attributeValue,
  }));
}

async function notifyRolesOnAcknowledgmentConfirmation(
  db: AppDb,
  input: {
    employeeId: number | string;
    employeeName: string;
    assetCode: string;
    distributionId: number;
  },
) {
  const [itAdmins, departmentHeads] = await Promise.all([
    db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "itAdmin"), eq(users.isActive, true))),
    db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.position, "departmentHead"), eq(users.isActive, true))),
  ]);

  const recipientIds = [
    ...new Set([
      input.employeeId,
      ...itAdmins.map((user) => user.id),
      ...departmentHeads.map((user) => user.id),
    ]),
  ];
  const normalizedRecipientIds = await normalizeNotificationRecipientIds(
    db,
    recipientIds,
  );

  if (normalizedRecipientIds.length === 0) {
    return;
  }

  await Promise.all(
    normalizedRecipientIds.map((userId) =>
      db
        .insert(notifications)
        .values({
          userId,
          type: "distributionUpdate",
          title: "Asset assignment confirmed",
          message: `${input.employeeName} signed acknowledgment for asset ${input.assetCode}.`,
          entityType: "distribution",
          entityId: String(input.distributionId),
          isRead: false,
        })
        .run(),
    ),
  );
}

async function normalizeNotificationRecipientIds(
  db: AppDb,
  recipients: Array<number | string | null | undefined>,
) {
  const numericIds = new Set<number>();
  const emails = new Set<string>();

  for (const recipient of recipients) {
    if (typeof recipient === "number" && Number.isInteger(recipient)) {
      numericIds.add(recipient);
      continue;
    }

    if (typeof recipient !== "string") {
      continue;
    }

    const trimmed = recipient.trim();
    if (!trimmed) {
      continue;
    }

    const parsed = Number(trimmed);
    if (Number.isInteger(parsed)) {
      numericIds.add(parsed);
      continue;
    }

    if (trimmed.includes("@")) {
      emails.add(trimmed.toLowerCase());
    }
  }

  if (emails.size > 0) {
    const emailRows = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.email, Array.from(emails)));

    for (const row of emailRows) {
      numericIds.add(row.id);
    }
  }

  if (numericIds.size === 0) {
    return [] as number[];
  }

  const existingRows = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.id, Array.from(numericIds)));

  return [...new Set(existingRows.map((row) => row.id))];
}

export async function createAssignmentAcknowledgment(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: CreateAcknowledgmentInput,
) {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
    const jwtId = crypto.randomUUID();
    const [acknowledgment] = await db
      .insert(assetAssignmentAcknowledgments)
      .values({
        assignmentRequestId: input.assignmentRequestId,
        assetId: input.assetId,
        employeeId: input.employeeId,
        recipientName: input.employeeName,
        recipientEmail: input.employeeEmail,
        recipientRole: input.recipientRole,
        jwtId,
        expiresAt,
        status: "pending",
        emailStatus: "pending",
      })
      .returning({
        id: assetAssignmentAcknowledgments.id,
      });

    const iat = Math.floor(now.getTime() / 1000);
    const exp = Math.floor(new Date(expiresAt).getTime() / 1000);
    const token = await createSignedJwt(
      {
        sub: "asset-assignment-ack",
        jti: jwtId,
        ackId: acknowledgment.id,
        assignmentRequestId: input.assignmentRequestId,
        employeeId: input.employeeId,
        iat,
        exp,
      } satisfies AssignmentAckJwtPayload,
      runtimeConfig.assignmentJwtSecret,
    );
    const acknowledgmentUrl = buildAcknowledgmentLink(runtimeConfig, token);
    const emailResult = await sendAssignmentAcknowledgmentEmail(runtimeConfig, {
      recipientEmail: input.employeeEmail,
      recipientName: input.employeeName,
      assetName: input.assetName,
      assetCode: input.assetCode,
      acknowledgmentUrl,
      expiresAt,
    });

    await db
      .update(assetAssignmentAcknowledgments)
      .set({
        emailStatus: emailResult.status,
        emailSentAt: emailResult.status === "sent" ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assetAssignmentAcknowledgments.id, acknowledgment.id))
      .run();

    return {
      acknowledgmentId: acknowledgment.id,
      token,
      acknowledgmentUrl,
      expiresAt,
      emailStatus: emailResult.status,
      emailError: emailResult.errorMessage,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown assignment acknowledgment create error.";
    throw new Error(`Failed to create assignment acknowledgment: ${message}`);
  }
}

export async function resendAssignmentAcknowledgmentEmail(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: {
    assignmentRequestId: number;
  },
): Promise<ResendAssignmentAcknowledgmentEmailResult> {
  try {
    const [acknowledgment] = await db
      .select({
        acknowledgmentId: assetAssignmentAcknowledgments.id,
        assignmentRequestId: assetAssignmentAcknowledgments.assignmentRequestId,
        assetId: assetAssignmentAcknowledgments.assetId,
        employeeId: assetAssignmentAcknowledgments.employeeId,
        recipientName: assetAssignmentAcknowledgments.recipientName,
        recipientEmail: assetAssignmentAcknowledgments.recipientEmail,
        recipientRole: assetAssignmentAcknowledgments.recipientRole,
        status: assetAssignmentAcknowledgments.status,
        tokenConsumedAt: assetAssignmentAcknowledgments.tokenConsumedAt,
        signedAt: assetAssignmentAcknowledgments.signedAt,
        fallbackEmployeeName: users.fullName,
        fallbackEmployeeEmail: users.email,
        assetName: assets.assetName,
        assetCode: assets.assetCode,
      })
      .from(assetAssignmentAcknowledgments)
      .innerJoin(
        assets,
        eq(assetAssignmentAcknowledgments.assetId, assets.id),
      )
      .leftJoin(
        users,
        eq(assetAssignmentAcknowledgments.employeeId, users.id),
      )
      .where(
        eq(
          assetAssignmentAcknowledgments.assignmentRequestId,
          input.assignmentRequestId,
        ),
      )
      .limit(1);

    if (!acknowledgment) {
      throw new Error(
        `Pending acknowledgment was not found for assignment request ${input.assignmentRequestId}.`,
      );
    }

    const normalizedStatus = (acknowledgment.status ?? "").trim().toLowerCase();
    const isConfirmed =
      normalizedStatus === "confirmed" ||
      Boolean(acknowledgment.tokenConsumedAt) ||
      Boolean(acknowledgment.signedAt);

    if (isConfirmed) {
      return {
        resent: false,
        emailStatus: "skipped",
        emailError: "Acknowledgment is already signed.",
        acknowledgmentUrl: null,
        expiresAt: null,
      };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = new Date(
      now.getTime() + 72 * 60 * 60 * 1000,
    ).toISOString();
    const jwtId = crypto.randomUUID();
    const iat = Math.floor(now.getTime() / 1000);
    const exp = Math.floor(new Date(expiresAt).getTime() / 1000);
    const token = await createSignedJwt(
      {
        sub: "asset-assignment-ack",
        jti: jwtId,
        ackId: acknowledgment.acknowledgmentId,
        assignmentRequestId: acknowledgment.assignmentRequestId,
        employeeId: acknowledgment.employeeId,
        iat,
        exp,
      } satisfies AssignmentAckJwtPayload,
      runtimeConfig.assignmentJwtSecret,
    );
    const acknowledgmentUrl = buildAcknowledgmentLink(runtimeConfig, token);

    const recipientName = resolveAcknowledgmentEmployeeName(
      acknowledgment.recipientName,
      acknowledgment.fallbackEmployeeName,
    );
    const recipientEmail = resolveAcknowledgmentEmployeeEmail(
      acknowledgment.recipientEmail,
      acknowledgment.fallbackEmployeeEmail,
    );

    const emailResult = await sendAssignmentAcknowledgmentEmail(runtimeConfig, {
      recipientEmail,
      recipientName,
      assetName: acknowledgment.assetName,
      assetCode: acknowledgment.assetCode,
      acknowledgmentUrl,
      expiresAt,
    });

    await db
      .update(assetAssignmentAcknowledgments)
      .set({
        recipientName,
        recipientEmail,
        jwtId,
        expiresAt,
        status: "pending",
        tokenConsumedAt: null,
        signerName: null,
        signerIpAddress: null,
        signatureText: null,
        signedAt: null,
        pdfObjectKey: null,
        pdfFileName: null,
        pdfUploadedAt: null,
        emailStatus: emailResult.status,
        emailSentAt: emailResult.status === "sent" ? nowIso : null,
        updatedAt: nowIso,
      })
      .where(eq(assetAssignmentAcknowledgments.id, acknowledgment.acknowledgmentId))
      .run();

    return {
      resent: true,
      emailStatus: emailResult.status,
      emailError: emailResult.errorMessage,
      acknowledgmentUrl,
      expiresAt,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown assignment acknowledgment resend error.";
    throw new Error(`Failed to resend assignment acknowledgment: ${message}`);
  }
}

export async function getAssignmentAcknowledgmentPreviewByToken(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  token: string,
): Promise<AssignmentAcknowledgmentPreviewRecord> {
  try {
    const payload = await verifyAssignmentAcknowledgmentJwt(runtimeConfig, token);
    const acknowledgment = await loadAcknowledgmentByJwtId(db, payload.jti);

    if (!acknowledgment) {
      throw new Error("Assignment acknowledgment was not found.");
    }

    ensurePendingAcknowledgment(acknowledgment, payload);
    const resolvedExpiresAt = resolveAcknowledgmentExpiresAt(
      acknowledgment.expiresAt,
      payload.exp,
    );
    const customAttributes = await loadAssetCustomAttributes(
      db,
      acknowledgment.assetId,
    );

    return {
      acknowledgmentId: String(acknowledgment.acknowledgmentId),
      assignmentRequestId: String(acknowledgment.assignmentRequestId),
      assetId: String(acknowledgment.assetId),
      assetCode: acknowledgment.assetCode,
      assetName: acknowledgment.assetName,
      category: acknowledgment.category,
      customAttributes,
      employeeId: String(acknowledgment.employeeId),
      employeeName: acknowledgment.employeeName,
      employeeEmail: acknowledgment.employeeEmail,
      recipientRole: acknowledgment.recipientRole ?? "Employee",
      expiresAt: resolvedExpiresAt,
      status: resolveAcknowledgmentStatus({
        status: acknowledgment.status,
        tokenConsumedAt: acknowledgment.tokenConsumedAt,
        signedAt: acknowledgment.signedAt,
        expiresAt: resolvedExpiresAt,
      }),
      signedAt: acknowledgment.signedAt,
      tokenConsumedAt: acknowledgment.tokenConsumedAt,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown assignment acknowledgment preview error.";
    throw new Error(`Failed to fetch assignment acknowledgment: ${message}`);
  }
}

export async function getAssignmentAcknowledgmentPdfByToken(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  token: string,
): Promise<AssignmentAcknowledgmentPdfRecord> {
  try {
    const payload = await verifyAssignmentAcknowledgmentJwt(runtimeConfig, token);
    const [acknowledgment] = await db
      .select({
        acknowledgmentId: assetAssignmentAcknowledgments.id,
        status: assetAssignmentAcknowledgments.status,
        pdfObjectKey: assetAssignmentAcknowledgments.pdfObjectKey,
        pdfFileName: assetAssignmentAcknowledgments.pdfFileName,
      })
      .from(assetAssignmentAcknowledgments)
      .where(eq(assetAssignmentAcknowledgments.jwtId, payload.jti))
      .limit(1);

    if (!acknowledgment) {
      throw new Error("Assignment acknowledgment was not found.");
    }

    const normalizedStatus = (acknowledgment.status ?? "").trim().toLowerCase();
    if (normalizedStatus !== "confirmed") {
      throw new Error(
        `Signed acknowledgment PDF is not available from status '${acknowledgment.status ?? "unknown"}'.`,
      );
    }

    if (!acknowledgment.pdfObjectKey) {
      throw new Error("Signed acknowledgment PDF object key is missing.");
    }

    const client = createR2Client(runtimeConfig);
    const response = await client.send(
      new GetObjectCommand({
        Bucket: runtimeConfig.r2BucketName!,
        Key: acknowledgment.pdfObjectKey,
      }),
    );
    const bytes = await response.Body?.transformToByteArray();

    if (!bytes || bytes.length === 0) {
      throw new Error("Signed acknowledgment PDF content is empty.");
    }

    return {
      fileName:
        acknowledgment.pdfFileName?.trim() ||
        `assignment-acknowledgment-${acknowledgment.acknowledgmentId}.pdf`,
      contentType: response.ContentType || "application/pdf",
      base64: Buffer.from(bytes).toString("base64"),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown assignment acknowledgment PDF load error.";
    throw new Error(`Failed to load assignment acknowledgment PDF: ${message}`);
  }
}

export async function signAssignmentAcknowledgment(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: {
    token: string;
    signerName: string;
    signatureText: string;
    signerIpAddress?: string | null;
  },
): Promise<AssignmentAcknowledgmentSignRecord> {
  try {
    const signerName = input.signerName.trim();
    const signatureText = input.signatureText.trim();

    if (!signerName) {
      throw new Error("Signer name is required.");
    }
    if (!signatureText) {
      throw new Error("Signature text is required.");
    }

    const payload = await verifyAssignmentAcknowledgmentJwt(
      runtimeConfig,
      input.token,
    );
    const acknowledgment = await loadAcknowledgmentByJwtId(db, payload.jti);

    if (!acknowledgment) {
      throw new Error("Assignment acknowledgment was not found.");
    }

    ensurePendingAcknowledgment(acknowledgment, payload);
    const distributionRef = await loadOrRecoverDistributionForAcknowledgment(
      db,
      acknowledgment,
    );

    if (!distributionRef) {
      throw new Error("Related distribution record was not found.");
    }

    const [distributionContext] = await db
      .select({
        id: assetDistributions.id,
        assetId: assetDistributions.assetId,
        employeeId: assetDistributions.employeeId,
        status: assetDistributions.status,
        employeeName: users.fullName,
        employeeEmail: users.email,
        assetName: assets.assetName,
        assetCode: assets.assetCode,
        category: assets.category,
      })
      .from(assetDistributions)
      .innerJoin(users, eq(assetDistributions.employeeId, users.id))
      .innerJoin(assets, eq(assetDistributions.assetId, assets.id))
      .where(eq(assetDistributions.id, distributionRef.id))
      .limit(1);

    if (!distributionContext) {
      throw new Error("Related distribution record details were not found.");
    }

    const customAttributes = await loadAssetCustomAttributes(
      db,
      distributionContext.assetId,
    );

    if (distributionContext.status !== "pendingHandover") {
      await db
        .update(assetDistributions)
        .set({
          status: "pendingHandover",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(assetDistributions.id, distributionRef.id))
        .run();
    }

    const signedAt = new Date().toISOString();
    const pdfBuffer = await renderAcknowledgmentPdf({
      employeeName: distributionContext.employeeName,
      employeeEmail: distributionContext.employeeEmail,
      recipientRole: acknowledgment.recipientRole ?? "Employee",
      assetName: distributionContext.assetName,
      assetCode: distributionContext.assetCode,
      category: distributionContext.category,
      customAttributes,
      signerName,
      signatureText,
      signedAt,
    });
    const uploadedPdf = await uploadAcknowledgmentPdfToR2(runtimeConfig, {
      acknowledgmentId: acknowledgment.acknowledgmentId,
      pdfBuffer,
    });
    await db
      .update(assetAssignmentAcknowledgments)
      .set({
        status: "confirmed",
        tokenConsumedAt: signedAt,
        signerName,
        signerIpAddress: input.signerIpAddress?.trim() || null,
        signatureText,
        signedAt,
        pdfObjectKey: uploadedPdf.objectKey,
        pdfFileName: uploadedPdf.fileName,
        pdfUploadedAt: signedAt,
        updatedAt: signedAt,
      })
      .where(eq(assetAssignmentAcknowledgments.id, acknowledgment.acknowledgmentId))
      .run();

    await db
      .update(assetDistributions)
      .set({
        status: "active",
        updatedAt: signedAt,
      })
      .where(eq(assetDistributions.id, distributionRef.id))
      .run();

    await db
      .update(assets)
      .set({
        assetStatus: "assigned",
        updatedAt: signedAt,
      })
      .where(eq(assets.id, distributionContext.assetId))
      .run();

    try {
      await notifyRolesOnAcknowledgmentConfirmation(db, {
        employeeId: distributionContext.employeeId,
        employeeName: distributionContext.employeeName,
        assetCode: distributionContext.assetCode,
        distributionId: distributionRef.id,
      });
    } catch (notificationError) {
      console.error(
        "Assignment acknowledgment signed, but failed to notify recipients.",
        notificationError,
      );
    }

    const distribution = await getDistributionById(db, distributionRef.id);
    if (!distribution) {
      throw new Error(
        "Distribution could not be reloaded after signing acknowledgment.",
      );
    }

    return {
      acknowledgmentId: String(acknowledgment.acknowledgmentId),
      pdfObjectKey: uploadedPdf.objectKey,
      pdfFileName: uploadedPdf.fileName,
      pdfContentType: "application/pdf",
      pdfBase64: pdfBuffer.toString("base64"),
      status: "confirmed",
      signedAt,
      distribution,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown assignment acknowledgment sign error.";
    throw new Error(`Failed to sign assignment acknowledgment: ${message}`);
  }
}

export async function notifyHrManagersOfAssignmentConflict(
  db: AppDb,
  input: {
    employeeId: number;
    employeeName: string;
    category: string;
    assetCode: string;
    conflictAssetCode: string;
  },
) {
  const hrManagers = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "hrManager"), eq(users.isActive, true)));

  if (hrManagers.length === 0) {
    return;
  }

  const message = `${input.employeeName} already holds an active asset in category '${input.category}' (${input.conflictAssetCode}). New assignment request: ${input.assetCode}.`;
  await Promise.all(
    hrManagers.map((hr) =>
      db
        .insert(notifications)
        .values({
          userId: hr.id,
          type: "distributionUpdate",
          title: "Assignment conflict warning",
          message,
          entityType: "employee",
          entityId: String(input.employeeId),
          isRead: false,
        })
        .run(),
    ),
  );
}
