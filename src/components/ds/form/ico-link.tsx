import { ExternalLink } from "lucide-react";

import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

export type IcoLinkTarget = "auto" | "or" | "ares";

/** Ověří české osmimístné IČO váženým součtem modulo 11. */
export function isValidCzIco(value: string): boolean {
  const ico = value.replace(/\s/g, "");
  if (!/^\d{8}$/.test(ico)) return false;
  const digits = [...ico].map(Number);
  const sum = digits.slice(0, 7).reduce((total, digit, index) => total + digit * (8 - index), 0);
  const remainder = sum % 11;
  const check = remainder === 0 ? 1 : remainder === 1 ? 0 : 11 - remainder;
  return check === digits[7];
}

export function icoRegistryUrl(ico: string, target: Exclude<IcoLinkTarget, "auto"> = "or"): string {
  const clean = ico.replace(/\s/g, "");
  return target === "ares"
    ? `https://ares.gov.cz/ekonomicke-subjekty?ico=${encodeURIComponent(clean)}`
    : `https://or.justice.cz/ias/ui/rejstrik-$firma?ico=${encodeURIComponent(clean)}`;
}

export interface IcoLinkProps {
  ico?: string;
  /** @deprecated Použijte `ico`. */
  value?: string;
  country?: string;
  kind?: "company" | "person";
  target?: IcoLinkTarget;
  className?: string;
}

/** České IČO s ověřeným odkazem do obchodního rejstříku nebo ARES. */
export function IcoLink({ ico: icoProp, value, country, kind = "company", target = "auto", className }: IcoLinkProps) {
  const ico = (icoProp || value || "").trim();
  const dsTexts = useDsTexts();
  const resolvedTitle = title ?? dsTexts.contacts.openRegistry;
  if (!ico) return null;
  const resolved = target === "auto" ? (kind === "person" ? "ares" : "or") : target;
  const linked = (!country || country.toUpperCase() === "CZ") && isValidCzIco(ico);
  const label = resolved === "ares" ? "Otevřít v ARES" : "Otevřít v obchodním rejstříku";
  if (!linked) return <span className={cn("font-mono tabular-nums", className)}>{ico}</span>;
  return (
    <a
      href={icoRegistryUrl(ico, resolved)}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={`${ico} – ${label}`}
      className={cn("inline-flex items-center gap-1 font-mono tabular-nums text-primary underline-offset-4 hover:underline", className)}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {ico}
      <ExternalLink className="size-3" aria-hidden="true" />
    </a>
  );
}
