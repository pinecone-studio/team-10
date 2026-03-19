import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { asc, eq, inArray } from "drizzle-orm";
import { assets, receiveItems, receives, storage } from "../database/schema.ts";
import type { AppDb } from "./db.ts";

export type AssetLabelPdfRecord = {
  fileName: string;
  contentType: string;
  base64: string;
  assetCount: number;
};

type AssetLabelRow = {
  assetCode: string;
  assetName: string;
  qrCode: string;
  serialNumber: string | null;
  storageName: string | null;
};

async function loadAssetsForLabels(
  db: AppDb,
  assetCodes: string[],
): Promise<AssetLabelRow[]> {
  const normalizedAssetCodes = Array.from(
    new Set(assetCodes.map((assetCode) => assetCode.trim()).filter(Boolean)),
  );

  if (normalizedAssetCodes.length === 0) {
    throw new Error("Select at least one asset.");
  }

  const rows = await db
    .select({
      assetCode: assets.assetCode,
      assetName: assets.assetName,
      qrCode: assets.qrCode,
      serialNumber: assets.serialNumber,
      storageName: storage.storageName,
    })
    .from(assets)
    .leftJoin(receiveItems, eq(assets.receiveItemId, receiveItems.id))
    .leftJoin(receives, eq(receiveItems.receiveId, receives.id))
    .leftJoin(storage, eq(assets.currentStorageId, storage.id))
    .where(inArray(assets.assetCode, normalizedAssetCodes))
    .orderBy(asc(assets.assetCode));

  if (rows.length === 0) {
    throw new Error("No assets were found for the requested labels.");
  }

  return rows;
}

function buildFileName(records: AssetLabelRow[]) {
  if (records.length === 1) {
    return `${records[0].assetCode}-labels.pdf`;
  }

  return `asset-labels-${new Date().toISOString().slice(0, 10)}.pdf`;
}

async function renderPdf(records: AssetLabelRow[]) {
  const document = new PDFDocument({
    size: "A4",
    margin: 24,
    info: {
      Title: "Asset QR Labels",
      Author: "AMSS",
      Subject: "Printable asset labels",
    },
  });

  const chunks: Uint8Array[] = [];
  document.on("data", (chunk) => chunks.push(chunk as Uint8Array));

  const pageWidth = document.page.width;
  const pageHeight = document.page.height;
  const margin = 24;
  const columns = 2;
  const rows = 5;
  const gap = 12;
  const labelWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
  const labelHeight = (pageHeight - margin * 2 - gap * (rows - 1)) / rows;

  for (const [index, record] of records.entries()) {
    if (index > 0 && index % (columns * rows) === 0) {
      document.addPage();
    }

    const slot = index % (columns * rows);
    const columnIndex = slot % columns;
    const rowIndex = Math.floor(slot / columns);
    const x = margin + columnIndex * (labelWidth + gap);
    const y = margin + rowIndex * (labelHeight + gap);
    const qrSize = 72;
    const qrDataUrl = await QRCode.toDataURL(record.qrCode, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    document
      .roundedRect(x, y, labelWidth, labelHeight, 12)
      .lineWidth(1)
      .strokeColor("#d6e1ee")
      .fillAndStroke("#ffffff", "#d6e1ee");

    document.image(qrDataUrl, x + 14, y + 14, {
      fit: [qrSize, qrSize],
      align: "center",
      valign: "center",
    });

    const textX = x + 14 + qrSize + 12;
    const textWidth = labelWidth - (textX - x) - 14;

    document
      .fillColor("#0f172a")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(record.assetCode, textX, y + 16, {
        width: textWidth,
      });

    document
      .fillColor("#1e293b")
      .fontSize(10)
      .font("Helvetica")
      .text(record.assetName, textX, y + 34, {
        width: textWidth,
        height: 28,
        ellipsis: true,
      });

    const detailLines = [
      `Serial: ${record.serialNumber || "-"}`,
      `Location: ${record.storageName || "Main warehouse / Intake"}`,
      `QR: ${record.qrCode}`,
    ];

    document
      .fillColor("#64748b")
      .fontSize(8)
      .font("Helvetica")
      .text(detailLines.join("\n"), x + 14, y + 94, {
        width: labelWidth - 28,
        height: labelHeight - 108,
        ellipsis: true,
      });
  }

  document.end();

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))));
    document.on("error", reject);
  });

  return buffer;
}

export async function generateAssetLabelsPdf(
  db: AppDb,
  assetCodes: string[],
): Promise<AssetLabelPdfRecord> {
  try {
    const records = await loadAssetsForLabels(db, assetCodes);
    const pdfBuffer = await renderPdf(records);

    return {
      fileName: buildFileName(records),
      contentType: "application/pdf",
      base64: pdfBuffer.toString("base64"),
      assetCount: records.length,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown asset label PDF error.";
    throw new Error(`Failed to generate asset labels PDF: ${message}`);
  }
}
