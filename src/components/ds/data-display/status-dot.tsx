/** Zdieľaná kompaktná značka stavu (aktívny/neaktívny) pre gridy. */
export function StatusDot({
  active,
  activeLabel = "Aktívny",
  inactiveLabel = "Neaktívny",
  inactiveTone = "muted",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  inactiveTone?: "muted" | "danger";
}) {
  const label = active ? activeLabel : inactiveLabel;
  const cls = active
    ? "bg-emerald-500"
    : inactiveTone === "danger"
      ? "bg-red-500"
      : "bg-muted-foreground/40";
  return (
    <span title={label} aria-label={label} className="inline-flex items-center justify-center">
      <span className={`inline-block size-2.5 rounded-full ${cls}`} />
    </span>
  );
}
