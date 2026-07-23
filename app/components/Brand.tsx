import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand" aria-label="Certlery">
      <span className="brand-mark" aria-hidden="true">
        <Image
          src="/certlery-logo.png"
          alt=""
          width={compact ? 30 : 36}
          height={compact ? 30 : 36}
          sizes={compact ? "30px" : "36px"}
          priority
        />
      </span>
      <span className="brand-name">Certlery</span>
    </span>
  );
}
