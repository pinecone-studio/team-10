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
    <main className="min-h-screen bg-[#f1f5f9] px-4 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-[760px] rounded-[18px] border border-[#dbe4ee] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
        <h1 className="text-[24px] font-semibold text-[#0f172a]">Asset Assignment Acknowledgment</h1>
        <p className="mt-2 text-[14px] text-[#64748b]">
          Sign this one-time form to confirm your assignment.
        </p>

        {isLoading ? (
          <p className="mt-6 text-[14px] text-[#334155]">Loading acknowledgment details...</p>
        ) : preview ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 md:grid-cols-2">
              <Info label="Employee" value={resolveEmployeeNameValue(preview)} />
              <Info label="Email" value={resolveEmployeeEmailValue(preview)} />
              <Info label="Asset Name" value={preview.assetName} />
              <Info label="Asset Code" value={preview.assetCode} />
              <Info label="Asset Category" value={preview.category} />
            </div>

            <label className="flex flex-col gap-2 text-[13px] text-[#334155]">
              <span>Signer name</span>
              <input
                value={signerName}
                onChange={(event) => setSignerName(event.target.value)}
                className="h-11 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none"
                placeholder="Full name"
              />
            </label>

            <label className="flex flex-col gap-2 text-[13px] text-[#334155]">
              <span>Electronic signature</span>
              <textarea
                value={signatureText}
                onChange={(event) => setSignatureText(event.target.value)}
                rows={4}
                className="rounded-[10px] border border-[#dbe4ee] bg-white px-3 py-2 text-[14px] text-[#0f172a] outline-none"
                placeholder="Type your signature (example: I agree, John Doe)"
              />
            </label>

            <button
              type="button"
              onClick={() => void signAcknowledgment()}
              disabled={isSubmitting}
              className="h-11 rounded-[10px] bg-[#0f172a] px-5 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Signing..." : "Sign acknowledgment"}
            </button>

            {signedResult?.status === "confirmed" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void openSignedPdf()}
                  disabled={isOpeningPdf}
                  className="h-11 rounded-[10px] border border-[#0f172a] bg-white px-5 text-[14px] font-semibold text-[#0f172a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isOpeningPdf ? "Opening PDF..." : "Open signed PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => void downloadSignedPdf()}
                  disabled={isDownloadingPdf}
                  className="h-11 rounded-[10px] bg-[#0f172a] px-5 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDownloadingPdf ? "Downloading..." : "Download signed PDF"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {notice ? (
          <p className="mt-5 rounded-[10px] border border-[#dbe4ee] bg-[#f8fafc] px-4 py-3 text-[13px] text-[#1e293b]">
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
        <main className="min-h-screen bg-[#f1f5f9] px-4 py-10 text-slate-900">
          <section className="mx-auto w-full max-w-[760px] rounded-[18px] border border-[#dbe4ee] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
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
    <div className="rounded-[10px] border border-[#e2e8f0] bg-white px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">{label}</p>
      <p className="mt-1 text-[13px] text-[#0f172a]">{value}</p>
    </div>
  );
}
