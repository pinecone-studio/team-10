"use client";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchAssignmentAcknowledgmentRequest,
  fetchAssignmentAcknowledgmentPdfRequest,
  signAssignmentAcknowledgmentRequest,
  type AssignmentAcknowledgmentPdfDto,
  type AssignmentAcknowledgmentPreviewDto,
  type SignAssignmentAcknowledgmentResultDto,
} from "@/app/(dashboard)/_graphql/distribution/distribution-api";

function AssignmentAcknowledgmentContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);
  const [preview, setPreview] = useState<AssignmentAcknowledgmentPreviewDto | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [signedResult, setSignedResult] = useState<SignAssignmentAcknowledgmentResultDto | null>(
    null,
  );
  const isSigned = signedResult?.status === "confirmed";
  const previewCustomAttributes = preview?.customAttributes ?? [];

  function resolveEmployeeNameValue(record: AssignmentAcknowledgmentPreviewDto) {
    const employeeName = record.employeeName?.trim() ?? "";
    const employeeEmail = record.employeeEmail?.trim() ?? "";
    const nameLooksLikeEmail = employeeName.includes("@");
    const emailLooksLikeEmail = employeeEmail.includes("@");

    if (nameLooksLikeEmail && !emailLooksLikeEmail) {
      return employeeEmail || employeeName;
    }

    return employeeName || employeeEmail;
  }

  function resolveEmployeeEmailValue(record: AssignmentAcknowledgmentPreviewDto) {
    const employeeName = record.employeeName?.trim() ?? "";
    const employeeEmail = record.employeeEmail?.trim() ?? "";
    const nameLooksLikeEmail = employeeName.includes("@");
    const emailLooksLikeEmail = employeeEmail.includes("@");

    if (nameLooksLikeEmail && !emailLooksLikeEmail) {
      return employeeName;
    }

    return employeeEmail || employeeName;
  }

  function decodeBase64Pdf(base64: string) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  useEffect(() => {
    if (!token) {
      setPreview(null);
      setSignedResult(null);
      setNotice("Missing acknowledgment token.");
      return;
    }

    let live = true;
    setIsLoading(true);
    setNotice("");
    setSignedResult(null);
    void fetchAssignmentAcknowledgmentRequest(token)
      .then((record) => {
        if (!live) return;
        if (!record) {
          setPreview(null);
          setNotice("Acknowledgment was not found.");
          return;
        }

        setPreview(record);
        setSignerName(resolveEmployeeNameValue(record));
      })
      .catch((error) => {
        if (!live) return;
        setPreview(null);
        setNotice(error instanceof Error ? error.message : "Failed to load acknowledgment.");
      })
      .finally(() => {
        if (!live) return;
        setIsLoading(false);
      });

    return () => {
      live = false;
    };
  }, [token]);

  async function signAcknowledgment() {
    if (!token) {
      setNotice("Missing acknowledgment token.");
      return;
    }

    setIsSubmitting(true);
    setNotice("");
    try {
      const result = await signAssignmentAcknowledgmentRequest({
        token,
        signerName: signerName.trim(),
        signatureText: signatureText.trim(),
      });

      if (!result) {
        setNotice("Acknowledgment submission did not return data.");
      } else {
        setSignedResult(result);
        setNotice(
          `Acknowledgment signed successfully. Assignment is now ${result.distribution.status}. PDF stored as ${result.pdfFileName ?? "uploaded file"}.`,
        );
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to sign acknowledgment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openSignedPdf() {
    if (!isSigned) {
      setNotice("Please sign acknowledgment first to open the signed PDF.");
      return;
    }

    if (!token) {
      setNotice("Missing acknowledgment token.");
      return;
    }

    setIsOpeningPdf(true);
    setNotice("");
    try {
      const targetUrl = `/assignment-acknowledgment/pdf?token=${encodeURIComponent(token)}`;
      const openedWindow = window.open(targetUrl, "_blank", "noopener,noreferrer");
      if (!openedWindow) {
        setNotice("Popup was blocked. Please allow popups and try again.");
      } else {
        setNotice("Opened signed PDF page.");
      }
    } finally {
      setIsOpeningPdf(false);
    }
  }

  async function resolveSignedPdfPayload(): Promise<AssignmentAcknowledgmentPdfDto> {
    if (signedResult?.pdfBase64) {
      return {
        fileName: signedResult.pdfFileName ?? "assignment-acknowledgment.pdf",
        contentType: signedResult.pdfContentType || "application/pdf",
        base64: signedResult.pdfBase64,
      };
    }

    if (!token) {
      throw new Error("Missing acknowledgment token.");
    }

    const payload = await fetchAssignmentAcknowledgmentPdfRequest(token);
    if (!payload?.base64) {
      throw new Error("Signed acknowledgment PDF is not available yet.");
    }

    return payload;
  }

  async function downloadSignedPdf() {
    if (!isSigned) {
      setNotice("Please sign acknowledgment first to download the signed PDF.");
      return;
    }

    setIsDownloadingPdf(true);
    setNotice("");

    try {
      const pdfPayload = await resolveSignedPdfPayload();
      const pdfBytes = decodeBase64Pdf(pdfPayload.base64);
      const blob = new Blob([pdfBytes], {
        type: pdfPayload.contentType || "application/pdf",
      });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = pdfPayload.fileName || "assignment-acknowledgment.pdf";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setNotice(`Downloaded signed PDF: ${pdfPayload.fileName}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to download signed PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_36%,#ffffff_74%)] px-4 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-[860px] rounded-[24px] border border-[#d8e8ff] bg-[rgba(255,255,255,0.86)] p-6 shadow-[0_22px_48px_rgba(30,64,175,0.14)] md:p-8">
        <h1 className="text-[34px] leading-[1.12] font-bold text-[#0f172a]">Asset Assignment Acknowledgment</h1>
        <p className="mt-3 text-[16px] text-[#64748b]">
          Sign this one-time form to confirm your assignment.
        </p>

        {isLoading ? (
          <p className="mt-6 text-[14px] text-[#334155]">Loading acknowledgment details...</p>
        ) : preview ? (
          <div className="mt-7 space-y-6">
            <div className="grid gap-3 rounded-[18px] border border-[#d8e8ff] bg-white/75 p-4 md:grid-cols-2">
              <Info label="Employee" value={resolveEmployeeNameValue(preview)} />
              <Info label="Email" value={resolveEmployeeEmailValue(preview)} />
              <Info label="Asset Name" value={preview.assetName} />
              <Info label="Asset Code" value={preview.assetCode} />
              <Info label="Asset Category" value={preview.category} />
              <Info label="Role" value={preview.recipientRole} />
            </div>

            <div className="rounded-[18px] border border-[#d8e8ff] bg-white/75 p-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">Custom Attributes</p>
              {previewCustomAttributes.length > 0 ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {previewCustomAttributes.map((attribute) => (
                    <Info
                      key={`${attribute.attributeName}-${attribute.attributeValue}`}
                      label={attribute.attributeName}
                      value={attribute.attributeValue}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-[#64748b]">No custom attributes on this asset.</p>
              )}
            </div>

            <label className="flex flex-col gap-2 text-[13px] text-[#334155]">
              <span>Signer name</span>
              <input
                value={signerName}
                onChange={(event) => setSignerName(event.target.value)}
                className="h-11 rounded-[12px] border border-[#d7e4f2] bg-white px-3 text-[14px] text-[#0f172a] outline-none"
                placeholder="Full name"
              />
            </label>

            <label className="flex flex-col gap-2 text-[13px] text-[#334155]">
              <span>Electronic signature</span>
              <textarea
                value={signatureText}
                onChange={(event) => setSignatureText(event.target.value)}
                rows={4}
                className="rounded-[12px] border border-[#d7e4f2] bg-white px-3 py-2 text-[14px] text-[#0f172a] outline-none"
                placeholder="Type your signature (example: I agree, John Doe)"
              />
            </label>

            <button
              type="button"
              onClick={() => void signAcknowledgment()}
              disabled={isSubmitting || isSigned}
              className="h-12 rounded-[12px] bg-[#0f172a] px-6 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSigned ? "Acknowledgment signed" : isSubmitting ? "Signing..." : "Sign acknowledgment"}
            </button>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void openSignedPdf()}
                disabled={isOpeningPdf || !isSigned}
                className="h-12 rounded-[12px] border border-[#0f172a] bg-white px-5 text-[15px] font-semibold text-[#0f172a] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:bg-[#f1f5f9] disabled:text-[#94a3b8]"
              >
                {isOpeningPdf ? "Opening PDF..." : "Open signed PDF"}
              </button>
              <button
                type="button"
                onClick={() => void downloadSignedPdf()}
                disabled={isDownloadingPdf || !isSigned}
                className="h-12 rounded-[12px] bg-[#0f172a] px-5 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#cbd5e1] disabled:text-[#475569]"
              >
                {isDownloadingPdf ? "Downloading..." : "Download signed PDF"}
              </button>
            </div>
          </div>
        ) : null}

        {notice ? (
          <p className="mt-6 rounded-[12px] border border-[#d7e4f2] bg-white/80 px-4 py-3 text-[13px] text-[#1e293b]">
            {notice}
          </p>
        ) : null}
      </section>
    </main>
  );
}

export default function AssignmentAcknowledgmentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_36%,#ffffff_74%)] px-4 py-10 text-slate-900">
          <section className="mx-auto w-full max-w-[860px] rounded-[24px] border border-[#d8e8ff] bg-[rgba(255,255,255,0.86)] p-6 shadow-[0_22px_48px_rgba(30,64,175,0.14)]">
            <p className="text-[14px] text-[#334155]">Loading acknowledgment page...</p>
          </section>
        </main>
      }
    >
      <AssignmentAcknowledgmentContent />
    </Suspense>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#d7e4f2] bg-white px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">{label}</p>
      <p className="mt-1 text-[13px] text-[#0f172a]">{value}</p>
    </div>
  );
}
