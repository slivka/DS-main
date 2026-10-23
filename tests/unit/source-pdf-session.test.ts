import { describe, expect, it, mock } from "bun:test";
import { createPdfSession } from "../../src/components/ds/feedback/source-pdf-session";

describe("životnost PDF náhledu", () => {
  it("rychlé dvojí přegenerování zachytí zrušené načítání i odmítnuté destroy", async () => {
    const onError = mock();
    const rendered = mock();
    const sessions = [createPdfSession(onError), createPdfSession(onError)];
    const pending: Promise<void>[] = [];
    for (const session of sessions) {
      let rejectLoad: (error: Error) => void = () => {};
      const loading = new Promise<void>((_, reject) => {
        rejectLoad = reject;
      });
      const destroy = mock(async () => {
        rejectLoad(new Error("Worker was terminated"));
        throw new Error("Worker was terminated");
      });
      pending.push(
        session.run(async () => {
          session.own({ destroy });
          await loading;
          rendered();
        }),
      );
      session.stop();
      session.stop();
      expect(destroy).toHaveBeenCalledTimes(1);
    }
    const latest = createPdfSession(onError);
    await latest.run(async () => {
      rendered();
    });
    await Promise.all(pending);
    expect(onError).not.toHaveBeenCalled();
    expect(rendered).toHaveBeenCalledTimes(1);
  });

  it("po pozdním importu již nevytváří načítání", async () => {
    const onError = mock();
    const load = mock();
    const session = createPdfSession(onError);
    let resolveImport: () => void = () => {};
    const imported = new Promise<void>((resolve) => {
      resolveImport = resolve;
    });
    const pending = session.run(async () => {
      await imported;
      if (!session.active) return;
      load();
    });
    session.stop();
    resolveImport();
    await pending;
    expect(load).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("skutečnou chybu aktivního dokumentu nadále hlásí", async () => {
    const onError = mock();
    const session = createPdfSession(onError);
    await session.run(async () => {
      throw new Error("Invalid PDF");
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
