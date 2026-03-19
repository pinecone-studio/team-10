"use client";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchAssignmentAcknowledgmentRequest,
  signAssignmentAcknowledgmentRequest,
  type AssignmentAcknowledgmentPreviewDto,
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

  useEffect(() => {
    if (!token) {
      setPreview(null);
      setNotice("Missing acknowledgment token.");
      return;
    }

    let live = true;
    setIsLoading(true);
    setNotice("");
    void fetchAssignmentAcknowledgmentRequest(token)
      .then((record) => {
        if (!live) return;
        if (!record) {
          setPreview(null);
          setNotice("Acknowledgment was not found.");
          return;
        }

        setPreview(record);
        setSignerName(record.employeeName);
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

  return (
    <main className="min-h-screen bg-[#f1f5f9] px-4 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-[760px] rounded-[18px] border border-[#dbe4ee] bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
        <h1 className="text-[24px] font-semibold text-[#0f172a]">Asset Assignment Acknowledgment</h1>
        <p className="mt-2 text-[14px] text-[#64748b]">
          Sign this one-time form to confirm your assignment. The link is valid for 72 hours.
        </p>

        {isLoading ? (
          <p className="mt-6 text-[14px] text-[#334155]">Loading acknowledgment details...</p>
        ) : preview ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 md:grid-cols-2">
              <Info label="Employee" value={preview.employeeName} />
              <Info label="Email" value={preview.employeeEmail} />
              <Info label="Asset" value={preview.assetName} />
              <Info label="Asset Code" value={preview.assetCode} />
              <Info label="Category" value={preview.category} />
              <Info label="Expires At" value={preview.expiresAt} />
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
