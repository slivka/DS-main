import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { SourcePreview } from "../../src/components/ds/feedback/source-preview";
import type { RecordAttachment } from "../../src/components/ds/feedback/attachment-list";

afterEach(cleanup);
const wrap = (children: React.ReactNode) => <TooltipProvider>{children}</TooltipProvider>;
const pdf: RecordAttachment = {
  id: "s",
  name: "Faktura.pdf",
  type: "application/pdf",
  size: 145_200,
  uploadedAt: "2026-10-19T09:00:00Z",
  previewUrl: "data:application/pdf,test",
};
const ACCEPT = ["application/pdf", "image/*"];
const LIMIT = 20_000_000;

describe("SourcePreview", () => {
  it("chyba PDF žádá aplikaci o obnovení adresy", () => {
    const expired = mock();
    const ui = render(
      wrap(<SourcePreview source={pdf} accept={ACCEPT} maxSize={LIMIT} onUrlExpired={expired} />),
    );
    const frame = ui.container.querySelector("iframe");
    if (!frame) throw new Error("PDF náhled chybí");
    fireEvent.error(frame);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(ui.getByRole("status").textContent).toContain("vypršela");
  });
  it("PDF vykreslí iframe s názvem souboru", () => {
    const { container, getByText } = render(
      wrap(<SourcePreview source={pdf} accept={ACCEPT} maxSize={LIMIT} />),
    );
    const frame = container.querySelector("iframe");
    expect(frame?.getAttribute("title")).toBe("Faktura.pdf");
    expect(getByText("Faktura.pdf")).toBeTruthy();
  });

  it("chyba načtení obrázku ohlásí vypršení adresy jen jednou", () => {
    const onUrlExpired = mock(() => undefined);
    const image = {
      ...pdf,
      type: "image/png",
      name: "sken.png",
      previewUrl: "data:image/png;base64,x",
    };
    const { container, getByRole } = render(
      wrap(
        <SourcePreview
          source={image}
          accept={ACCEPT}
          maxSize={LIMIT}
          onUrlExpired={onUrlExpired}
        />,
      ),
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("data:image/png;base64,x");
    fireEvent.error(img!);
    fireEvent.error(img!);
    expect(onUrlExpired).toHaveBeenCalledTimes(1);
    expect(getByRole("status").textContent).toContain("vypršela");
  });

  it("typ bez náhledu ukáže název, velikost a vysvětlení", () => {
    const isdoc = { ...pdf, type: "text/xml", name: "faktura.isdoc", previewUrl: undefined };
    const { container, getByText, getAllByText } = render(
      wrap(<SourcePreview source={isdoc} accept={ACCEPT} maxSize={LIMIT} />),
    );
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(getAllByText("faktura.isdoc").length).toBeGreaterThan(0);
    expect(getByText(/145,2 kB/)).toBeTruthy();
    expect(getByText(/není k dispozici/)).toBeTruthy();
  });

  it("prázdný stav nabídne nahrání a předá přijaté soubory", () => {
    const onUpload = mock(() => undefined);
    const { getByRole, container } = render(
      wrap(<SourcePreview source={null} accept={ACCEPT} maxSize={LIMIT} onUpload={onUpload} />),
    );
    const button = getByRole("button", { name: "Nahrát zdroj" });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = mock(() => undefined);
    input.click = click;
    fireEvent.click(button);
    expect(click).toHaveBeenCalledTimes(1);
    const file = new File(["x"], "scan.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onUpload.mock.calls[0]?.[0]).toHaveLength(1);
    const big = new File(["x"], "velky.pdf", { type: "application/pdf" });
    Object.defineProperty(big, "size", { value: LIMIT + 1 });
    fireEvent.change(input, { target: { files: [big] } });
    expect(onUpload.mock.calls[1]?.[1]).toHaveLength(1);
  });

  it("zděděný zdroj je jen ke čtení s odkazem na původ", () => {
    const onOpenOrigin = mock(() => undefined);
    const { getByRole, queryByRole } = render(
      wrap(
        <SourcePreview
          source={pdf}
          accept={ACCEPT}
          maxSize={LIMIT}
          onReplace={() => undefined}
          inheritedFrom={{ label: "Výpis č. 12/2026", onOpen: onOpenOrigin }}
        />,
      ),
    );
    expect(queryByRole("button", { name: "Nahradit" })).toBeNull();
    fireEvent.click(getByRole("button", { name: "Výpis č. 12/2026" }));
    expect(onOpenOrigin).toHaveBeenCalledTimes(1);
  });

  it("nástroje volají aplikaci; zablokovaná náhrada vysvětlí důvod", () => {
    const onDownload = mock(() => undefined);
    const onOpen = mock(() => undefined);
    const onReplace = mock(() => undefined);
    const { getByRole } = render(
      wrap(
        <SourcePreview
          source={pdf}
          accept={ACCEPT}
          maxSize={LIMIT}
          canReplace={false}
          replaceDisabledReason="Máte pouze právo číst přílohy."
          onReplace={onReplace}
          onDownload={onDownload}
          onOpen={onOpen}
        />,
      ),
    );
    fireEvent.click(getByRole("button", { name: "Stáhnout" }));
    fireEvent.click(getByRole("button", { name: "Otevřít" }));
    expect(onDownload).toHaveBeenCalledWith(pdf);
    expect(onOpen).toHaveBeenCalledWith(pdf);
    const replace = getByRole("button", { name: "Nahradit" });
    expect(replace.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(replace);
    expect(onReplace).not.toHaveBeenCalled();
  });
});
