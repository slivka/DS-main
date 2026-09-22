/**
 * Proklikávacie IČO – otvorí výpis z Obchodného registra SR v novej karte.
 * Používa sa automaticky v gridoch pre stĺpec s id „ico“.
 */
export function icoRegistryUrl(ico: string): string {
  return `https://www.orsr.sk/hladaj_ico.asp?ICO=${encodeURIComponent(ico.replace(/\s/g, ""))}`;
}

export function IcoLink({ value }: { value: string }) {
  const ico = value.trim();
  if (!ico) return null;
  return (
    <a
      href={icoRegistryUrl(ico)}
      target="_blank"
      rel="noopener noreferrer"
      title="Zobrazit výpis z obchodního rejstříku"
      className="text-primary underline-offset-4 hover:underline"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {ico}
    </a>
  );
}
