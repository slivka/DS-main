import { expect, test } from "@playwright/test";

/** Identita má jedinou výšku a nepřekrývá se ani při maximálním zoomu. */
test("řádek identity bez překryvu v úzkém formuláři", async ({ page }) => {
  await page.goto("/components/record-panel", { waitUntil: "networkidle" });
  const section = page.getByTestId("extraction-narrow-section");
  await section.scrollIntoViewIfNeeded();
  const toggle = section.getByRole("button", { name: "Zobrazit úzký formulář" });
  const form = section.getByTestId("extraction-document-narrow");
  await expect
    .poll(
      async () => {
        if (!(await form.isVisible())) await toggle.click();
        return form.isVisible();
      },
      { timeout: 20_000 },
    )
    .toBe(true);
  for (const zoom of [16, 32]) for (const width of [360, 420, 480, 640]) {
    await page.evaluate((size) => { document.documentElement.style.fontSize = `${size}px`; }, zoom);
    await form.evaluate((node, w) => {
      (node as HTMLElement).style.maxWidth = `${w}px`;
    }, width);
    // Rozvržení se ustálí po přeměření řádku.
    await expect
      .poll(() => form.evaluate((node) => node.getBoundingClientRect().width))
      .toBe(width);
    await page.waitForTimeout(300);
    const overlaps = await form.evaluate((node) => {
      const row = node.querySelector('[data-slot="identity-line-row"]');
      if (!row) return ["chybí řádek"];
      const parts = [
        ...row.querySelectorAll<HTMLElement>(
          '[data-slot="identity-line-item"] > :not([aria-hidden]), [data-slot="identity-line-number"] > *, .document-identity-pencil-slot',
        ),
      ];
      // Prvky účtu jsou vnořené v položce; porovnáváme jen listové bloky bez vzájemného vnoření.
      const boxes = parts
        .filter((el) => !parts.some((other) => other !== el && other.contains(el)))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0);
      const account = row.querySelector(".document-identity-account");
      const leaves = boxes.flatMap(({ el, r }) =>
        el.contains(account)
          ? [
              ...el.querySelectorAll<HTMLElement>(
                ".document-identity-account > span, .document-identity-account-box, .document-identity-pencil-slot",
              ),
            ]
              .filter((x) => x.parentElement === account)
              .map((x) => ({ el: x, r: x.getBoundingClientRect() }))
          : [{ el, r }],
      );
      const issues: string[] = [];
      const rowBox = row.getBoundingClientRect();
      const control = parseFloat(getComputedStyle(row).getPropertyValue("--control-h"));
      if (Math.abs(rowBox.height - control) > 0.5) issues.push("výška není jeden control-h");
      if (row.hasAttribute("data-stacked")) issues.push("identita nesmí mít stacked režim");
      leaves.forEach((a, i) => {
        if (a.r.right > rowBox.right + 1 || a.r.left < rowBox.left - 1)
          issues.push(`mimo řádek: ${a.el.textContent}`);
        leaves.slice(i + 1).forEach((b) => {
          const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
          const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
          if (x > 1 && y > 1) issues.push(`${a.el.textContent} × ${b.el.textContent}`);
        });
      });
      return issues;
    });
    expect(overlaps, `šířka ${width}`).toEqual([]);
    // Tužka zůstává hned za textem účtu.
    const text = form.locator('[data-slot="document-identity-account-text"]');
    const pencil = form.locator(".document-identity-pencil-slot");
    const t = await text.boundingBox();
    const p = await pencil.boundingBox();
    if (!t || !p) throw new Error("Chybí účet nebo tužka");
    expect(p.x - (t.x + t.width), `tužka při ${width}`).toBeLessThanOrEqual(12);
  }
});
