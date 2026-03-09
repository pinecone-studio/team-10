import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type QrCodeBadgeProps = {
  value: string;
  label: string;
};

export function QrCodeBadge({ value, label }: QrCodeBadgeProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const qrPayload =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?qr=${encodeURIComponent(value)}`
      : value;

  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(qrPayload, { width: 96, margin: 1 })
      .then((url) => { if (active) setDataUrl(url); })
      .catch(() => { if (active) setDataUrl(''); });
    return () => { active = false; };
  }, [qrPayload]);

  if (!dataUrl) return <span className="row-meta">{value}</span>;

  return (
    <div className="qr-cell">
      <img src={dataUrl} alt={`QR for ${label}`} width={64} height={64} />
      <a href={dataUrl} download={`${label}-qr.png`} className="row-meta">Download</a>
    </div>
  );
}
