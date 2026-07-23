import { Award, Check } from "lucide-react";
import type { CertificateRecord } from "../lib/demo-certificates";

export function CertificateArtwork({
  certificate,
  compact = false,
}: {
  certificate: CertificateRecord;
  compact?: boolean;
}) {
  return (
    <div
      className={`certificate-art certificate-${certificate.orientation} tone-${certificate.tone} ${compact ? "is-compact" : ""}`}
      role="img"
      aria-label={`Preview of ${certificate.title}, issued by ${certificate.issuer}`}
    >
      <div className="certificate-inner">
        <Award className="certificate-crest" size={compact ? 16 : 22} strokeWidth={1.4} />
        <span className="certificate-kicker">Certificate of achievement</span>
        <strong>{certificate.title}</strong>
        <span className="certificate-line" />
        <small>{certificate.issuer}</small>
        <span className="seal"><Check size={compact ? 11 : 14} /></span>
      </div>
    </div>
  );
}
