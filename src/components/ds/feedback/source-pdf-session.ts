/** Životnost PDF načítání · vlastní úklid a zachycení chyb · nesmí hlásit zrušený náhled. */
interface PdfLoadingResource {
  /** Ukončení workeru a rozpracovaného načítání. */
  destroy: () => Promise<void>;
}

/** Jedna životnost náhledu; pozdní importy ani chyby nesmí oživit předchozí dokument. */
export function createPdfSession(onError: () => void) {
  let active = true;
  let resource: PdfLoadingResource | undefined;
  const destroy = (task: PdfLoadingResource) => {
    // PDF.js při destroy odmítá čekající práci; po zrušení jde o očekávaný úklid.
    void task.destroy().catch(() => {
      if (active) onError();
    });
  };
  return {
    get active() {
      return active;
    },
    own(task: PdfLoadingResource) {
      if (active) resource = task;
      else destroy(task);
    },
    async run(work: () => Promise<void>) {
      if (!active) return;
      try {
        await work();
      } catch {
        if (active) onError();
      }
    },
    stop() {
      active = false;
      if (resource) {
        const task = resource;
        resource = undefined;
        destroy(task);
      }
    },
  };
}
