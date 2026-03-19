import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import PDFDocument from "pdfkit";
import { and, eq } from "drizzle-orm";
import {
  assetAssignmentAcknowledgments,
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
  status: string;
  signedAt: string | null;
  distribution: DistributionRecord;
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
  expiresAt: string;
  status: string;
  tokenConsumedAt: string | null;
  signedAt: string | null;
  distributionId: number | null;
  distributionStatus: string | null;
};

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
      employeeId: users.id,
      employeeName: users.fullName,
      employeeEmail: users.email,
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
    .innerJoin(
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

  return acknowledgment as PendingAcknowledgmentRow | undefined;
}

function ensurePendingAcknowledgment(
  acknowledgment: PendingAcknowledgmentRow,
  payload: AssignmentAckJwtPayload,
) {
  if (payload.sub !== "asset-assignment-ack") {
    throw new Error("Assignment acknowledgment token subject is invalid.");
  }

  if (acknowledgment.acknowledgmentId !== payload.ackId) {
    throw new Error("Assignment acknowledgment token does not match record.");
  }

  if (acknowledgment.assignmentRequestId !== payload.assignmentRequestId) {
    throw new Error("Assignment acknowledgment request id mismatch.");
  }

  if (acknowledgment.employeeId !== payload.employeeId) {
    throw new Error("Assignment acknowledgment employee mismatch.");
  }

  if (acknowledgment.tokenConsumedAt) {
    throw new Error("This acknowledgment link has already been used.");
  }

  if (acknowledgment.status !== "pending") {
    throw new Error(
      `Acknowledgment cannot be signed from status '${acknowledgment.status}'.`,
    );
  }

  const expiresAtMs = Date.parse(acknowledgment.expiresAt);
  if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
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
  signerName: string;
  signatureText: string;
  signedAt: string;
}) {
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
    .text(`Name: ${input.employeeName}`)
    .text(`Email: ${input.employeeEmail}`)
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
    .text(`Category: ${input.category}`);

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

async function notifyRolesOnAcknowledgmentConfirmation(
  db: AppDb,
  input: {
    employeeId: number;
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

  await Promise.all(
    recipientIds.map((userId) =>
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

export async function getAssignmentAcknowledgmentPreviewByToken(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  token: string,
): Promise<AssignmentAcknowledgmentPreviewRecord> {
  try {
    const payload = await verifySignedJwt<AssignmentAckJwtPayload>(
      token,
      runtimeConfig.assignmentJwtSecret,
    );
    const acknowledgment = await loadAcknowledgmentByJwtId(db, payload.jti);

    if (!acknowledgment) {
      throw new Error("Assignment acknowledgment was not found.");
    }

    ensurePendingAcknowledgment(acknowledgment, payload);

    return {
      acknowledgmentId: String(acknowledgment.acknowledgmentId),
      assignmentRequestId: String(acknowledgment.assignmentRequestId),
      assetId: String(acknowledgment.assetId),
      assetCode: acknowledgment.assetCode,
      assetName: acknowledgment.assetName,
      category: acknowledgment.category,
      employeeId: String(acknowledgment.employeeId),
      employeeName: acknowledgment.employeeName,
      employeeEmail: acknowledgment.employeeEmail,
      recipientRole: acknowledgment.recipientRole ?? "Employee",
      expiresAt: acknowledgment.expiresAt,
      status: acknowledgment.status,
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

    const payload = await verifySignedJwt<AssignmentAckJwtPayload>(
      input.token,
      runtimeConfig.assignmentJwtSecret,
    );
    const acknowledgment = await loadAcknowledgmentByJwtId(db, payload.jti);

    if (!acknowledgment) {
      throw new Error("Assignment acknowledgment was not found.");
    }

    ensurePendingAcknowledgment(acknowledgment, payload);

    if (!acknowledgment.distributionId) {
      throw new Error("Related distribution record was not found.");
    }

    if (acknowledgment.distributionStatus !== "pendingHandover") {
      throw new Error(
        "Only pending handover distributions can be confirmed by acknowledgment.",
      );
    }

    const signedAt = new Date().toISOString();
    const pdfBuffer = await renderAcknowledgmentPdf({
      employeeName: acknowledgment.employeeName,
      employeeEmail: acknowledgment.employeeEmail,
      recipientRole: acknowledgment.recipientRole ?? "Employee",
      assetName: acknowledgment.assetName,
      assetCode: acknowledgment.assetCode,
      category: acknowledgment.category,
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
      .where(eq(assetDistributions.id, acknowledgment.distributionId))
      .run();

    await db
      .update(assets)
      .set({
        assetStatus: "assigned",
        currentStorageId: null,
        updatedAt: signedAt,
      })
      .where(eq(assets.id, acknowledgment.assetId))
      .run();

    await notifyRolesOnAcknowledgmentConfirmation(db, {
      employeeId: acknowledgment.employeeId,
      employeeName: acknowledgment.employeeName,
      assetCode: acknowledgment.assetCode,
      distributionId: acknowledgment.distributionId,
    });

    const distribution = await getDistributionById(db, acknowledgment.distributionId);
    if (!distribution) {
      throw new Error(
        "Distribution could not be reloaded after signing acknowledgment.",
      );
    }

    return {
      acknowledgmentId: String(acknowledgment.acknowledgmentId),
      pdfObjectKey: uploadedPdf.objectKey,
      pdfFileName: uploadedPdf.fileName,
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
