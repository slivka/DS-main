/** PDF zdroje · vlastní klientské vykreslení podle šířky · nesmí načítat doménová data. */
import { useEffect, useRef } from "react";

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
    let stopped = false;
    let loaded = false;
    let generation = 0;
    let dispose = () => {};
    let observer: ResizeObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      const document = element.contentDocument;
      if (!document || stopped || loaded) return;
      loaded = true;
      try {
        // Import jen v efektu: PDF.js potřebuje prohlížeč, nikoli SSR runtime.
        const pdfjs = await import("pdfjs-dist");
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const task = pdfjs.getDocument(url);
        dispose = () => { void task.destroy(); };
        const pdf = await task.promise;
        const render = async () => {
          const current = ++generation;
          const width = document.documentElement.clientWidth;
          if (!width || stopped) return;
          const pages = document.createDocumentFragment();
          for (let number = 1; number <= pdf.numPages; number++) {
            const page = await pdf.getPage(number);
            if (stopped || current !== generation) return;
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
            await page.render({ canvas, canvasContext: context, viewport,
              transform: density === 1 ? undefined : [density, 0, 0, density, 0, 0],
            }).promise;
            pages.append(canvas);
          }
          if (!stopped && current === generation) document.body.replaceChildren(pages);
        };
        const refresh = () => { void render().catch(() => { if (!stopped) error.current(); }); };
        observer = new ResizeObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(refresh, 80);
        });
        observer.observe(element);
        refresh();
      } catch {
        if (!stopped) error.current();
      }
    };
    element.addEventListener("load", load);
    if (element.contentDocument?.readyState === "complete") void load();
    return () => {
      stopped = true;
      generation++;
      clearTimeout(timer);
      element.removeEventListener("load", load);
      observer?.disconnect();
      dispose();
    };
  }, [url]);
  return <iframe ref={frame} title={title} onError={onError}
    data-slot="source-pdf-preview"
    className="absolute inset-0 h-full w-full border-0"
    srcDoc={'<!doctype html><html><head><style>html,body{margin:0;width:100%;}html{overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable;}canvas{max-width:100%;}</style></head><body></body></html>'}
  />;
}