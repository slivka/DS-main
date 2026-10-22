/** Interní fronta zápisů: operace zachytí svůj store; zrušení nezasahuje rozběhnutý zápis. */
export class GridPrefsSaveQueue {
  private pending = new Map<
    string,
    { timer: ReturnType<typeof setTimeout>; run: () => Promise<void> }
  >();
  private active = new Set<Promise<void>>();

  schedule(key: string, run: () => Promise<void>) {
    const previous = this.pending.get(key);
    if (previous) clearTimeout(previous.timer);
    const timer = setTimeout(() => this.start(key), 600);
    this.pending.set(key, { timer, run });
  }

  private start(key: string) {
    const job = this.pending.get(key);
    if (!job) return;
    clearTimeout(job.timer);
    this.pending.delete(key);
    const promise = job.run();
    this.active.add(promise);
    void promise.finally(() => this.active.delete(promise));
  }

  cancel() {
    for (const job of this.pending.values()) clearTimeout(job.timer);
    this.pending.clear();
    // Staré operace doběhnou do původního store, nový scope na ně nečeká.
    this.active.clear();
  }

  async flush(timeoutMs?: number): Promise<void> {
    for (const key of [...this.pending.keys()]) this.start(key);
    const done = Promise.all([...this.active]).then(() => undefined);
    if (timeoutMs === undefined) return done;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        done,
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, Math.max(0, timeoutMs));
        }),
      ]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  }
}
