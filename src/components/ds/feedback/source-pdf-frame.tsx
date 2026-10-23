/** PDF zdroje · vlastní klientské vykreslení podle šířky · nesmí načítat doménová data. */
import { useEffect, useRef } from "react";
import { createPdfSession } from "./source-pdf-session";

/** Vnitřní vlastnosti náhledu, adresu a chybovou obsluhu dodává SourcePreview. */
interface SourcePdfPreviewProps {
  /** Podepsaná adresa dokumentu. */
  url: string;
  /** Přístupný název. */
  title: string;
  /** Chyba načtení. */
  onError: () => void;
}

/** Iframe má vlastní svislé posouvání; PDF.js stránky vždy změří podle aktuální šířky. */
export function SourcePdfPreview({ url, title, onError }: SourcePdfPreviewProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const error = useRef(onError);
  error.current = onError;
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const session = createPdfSession(() => error.current());
    const request = new AbortController();
    const reportError = () => {
      if (session.active) error.current();
    };
    element.addEventListener("error", reportError);
    let loaded = false;
    let generation = 0;
    let observer: ResizeObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      const document = element.contentDocument;
      if (!document || !session.active || loaded) return;
      loaded = true;
      await session.run(async () => {
        // Import jen v efektu: PDF.js potřebuje prohlížeč, nikoli SSR runtime.
        const pdfjs = await import("pdfjs-dist");
        if (!session.active) return;
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        if (!session.active) return;
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        // PDF.js 5.x ignoruje Promise z ReadableStream.cancel při destroy síťového readeru.
        // Bajty načítáme s vlastním abortem; celý fetch i úklid zůstává zachycen v session.
        const response = await fetch(url, { signal: request.signal });
        if (!session.active) return;
        if (!response.ok) throw new Error(`PDF HTTP ${response.status}`);
        const data = await response.arrayBuffer();
        if (!session.active) return;
        const task = pdfjs.getDocument({ data, ownerDocument: document });
        session.own(task);
        const pdf = await task.promise;
        if (!session.active) return;
        const render = async () => {
          const current = ++generation;
          const width = document.body.clientWidth;
          if (!width || !session.active) return;
          const pages = document.createDocumentFragment();
          for (let number = 1; number <= pdf.numPages; number++) {
            const page = await pdf.getPage(number);
            if (!session.active || current !== generation) return;
            const base = page.getViewport({ scale: 1 });
            const scale = width / base.width;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) return;
            const density = window.devicePixelRatio || 1;
            canvas.width = Math.ceil(viewport.width * density);
            canvas.height = Math.ceil(viewport.height * density);
            canvas.style.width = "100%";
            canvas.style.display = "block";
            const text = await page.getTextContent();
            if (!session.active || current !== generation) return;
            canvas.setAttribute("role", "img");
            canvas.setAttribute(
              "aria-label",
              text.items.map((item) => ("str" in item ? item.str : "")).join(" "),
            );
            await page.render({
              canvas,
              canvasContext: context,
              viewport,
              transform: density === 1 ? undefined : [density, 0, 0, density, 0, 0],
            }).promise;
            pages.append(canvas);
          }
          if (session.active && current === generation) document.body.replaceChildren(pages);
        };
        const refresh = () => {
          void session.run(render);
        };
        observer = new ResizeObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(refresh, 80);
        });
        observer.observe(element);
        refresh();
      });
    };
    // Srcdoc může být připraveno před připojením React load handleru.
    const check = window.setInterval(() => {
      if (
        element.contentDocument?.URL !== "about:srcdoc" ||
        element.contentDocument.readyState !== "complete"
      )
        return;
      window.clearInterval(check);
      element.removeEventListener("error", reportError);
      void load();
    }, 20);
    return () => {
      session.stop();
      request.abort();
      element.removeEventListener("error", reportError);
      window.clearInterval(check);
      generation++;
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [url]);
  return (
    <iframe
      ref={frame}
      title={title}
      data-slot="source-pdf-preview"
      className="absolute inset-0 h-full w-full border-0"
      srcDoc={
        "<!doctype html><html><head><style>html,body{margin:0;width:100%;}html{overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable;}canvas{max-width:100%;}</style></head><body></body></html>"
      }
    />
  );
}
