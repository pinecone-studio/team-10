"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchAssignmentAcknowledgmentPdfRequest,
  type AssignmentAcknowledgmentPdfDto,
} from "@/app/(dashboard)/_graphql/distribution/distribution-api";

function AssignmentAcknowledgmentPdfContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);
  const [pdfPayload, setPdfPayload] = useState<AssignmentAcknowledgmentPdfDto | null>(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      setPdfPayload(null);
      setNotice("Missing acknowledgment token.");
      return;
    }

    let live = true;
    setIsLoading(true);
    setNotice("");

    void fetchAssignmentAcknowledgmentPdfRequest(token)
      .then((payload) => {
        if (!live) return;
        if (!payload?.base64) {
          setPdfPayload(null);
          setNotice("Signed acknowledgment PDF is not available yet.");
          return;
        }

        setPdfPayload(payload);
      })
      .catch((error) => {
        if (!live) return;
        setPdfPayload(null);
        const message =
          error instanceof Error ? error.message : "Failed to load signed PDF.";
        if (message.toLowerCase().includes("status 'pending'")) {
          setNotice("Signed PDF is unavailable until the acknowledgment is signed.");
          return;
        }
        setNotice(message);
      })
      .finally(() => {
        if (!live) return;
        setIsLoading(false);
      });

    return () => {
      live = false;
    };
  }, [token]);

  useEffect(() => {
    if (!pdfPayload?.base64) {
      setPdfObjectUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
      return;
    }

    const pdfBytes = decodeBase64Pdf(pdfPayload.base64);
    const blob = new Blob([pdfBytes], {
      type: pdfPayload.contentType || "application/pdf",
    });
    const nextObjectUrl = URL.createObjectURL(blob);
    setPdfObjectUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return nextObjectUrl;
    });

    return () => URL.revokeObjectURL(nextObjectUrl);
  }, [pdfPayload]);

  async function downloadPdf() {
    if (!pdfPayload?.base64) {
      setNotice("Signed acknowledgment PDF is not available yet.");
      return;
    }

    setIsDownloading(true);
    setNotice("");
    try {
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
      setIsDownloading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_36%,#ffffff_74%)] px-4 py-8 text-slate-900">
      <section className="mx-auto w-full max-w-[1080px] rounded-[24px] border border-[#d8e8ff] bg-[rgba(255,255,255,0.86)] p-5 shadow-[0_22px_48px_rgba(30,64,175,0.14)] md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#0f172a]">Signed Acknowledgment PDF</h1>
            <p className="mt-1 text-[14px] text-[#64748b]">
              View and download the signed assignment acknowledgment.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void downloadPdf()}
            disabled={isDownloading || !pdfPayload}
            className="h-11 rounded-[12px] bg-[#0f172a] px-4 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>

        {isLoading ? (
          <p className="text-[14px] text-[#334155]">Loading signed PDF...</p>
        ) : pdfObjectUrl ? (
          <iframe
            title="Signed acknowledgment PDF"
            src={pdfObjectUrl}
            className="h-[75vh] w-full rounded-[14px] border border-[#d7e4f2]"
          />
        ) : (
          <p className="text-[14px] text-[#334155]">Signed PDF is unavailable.</p>
        )}

        {notice ? (
          <p className="mt-4 rounded-[12px] border border-[#d7e4f2] bg-white/80 px-4 py-3 text-[13px] text-[#1e293b]">
            {notice}
          </p>
        ) : null}
      </section>
    </main>
  );
}

export default function AssignmentAcknowledgmentPdfPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_36%,#ffffff_74%)] px-4 py-8 text-slate-900">
          <section className="mx-auto w-full max-w-[1080px] rounded-[24px] border border-[#d8e8ff] bg-[rgba(255,255,255,0.86)] p-6 shadow-[0_22px_48px_rgba(30,64,175,0.14)]">
            <p className="text-[14px] text-[#334155]">Loading signed PDF page...</p>
          </section>
        </main>
      }
    >
      <AssignmentAcknowledgmentPdfContent />
    </Suspense>
  );
}
