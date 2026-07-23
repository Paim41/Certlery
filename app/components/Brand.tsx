import { FileBadge2 } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand" aria-label="Certlery">
      <span className="brand-mark" aria-hidden="true">
        <FileBadge2 size={compact ? 18 : 21} strokeWidth={1.8} />
      </span>
      <span className="brand-name">Certlery</span>
    </span>
  );
}
