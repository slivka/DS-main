import { Fragment } from "react";
import { SLIVKA_FONT_LINKS } from "./lib/font-links";
import { THEME_INIT_SCRIPT } from "./lib/theme";

export interface SlivkaHeadProps {
  /** Nonce pro Content Security Policy. */
  nonce?: string;
  fonts?: boolean;
  themeScript?: boolean;
}

/** Odkazy na IBM Plex a časný inicializační skript motivu pro hlavičku dokumentu. */
export function SlivkaHead({ nonce, fonts = true, themeScript = true }: SlivkaHeadProps) {
  return (
    <Fragment>
      {fonts
        ? SLIVKA_FONT_LINKS.map((link) => <link key={`${link.rel}:${link.href}`} {...link} />)
        : null}
      {themeScript ? (
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      ) : null}
    </Fragment>
  );
}
