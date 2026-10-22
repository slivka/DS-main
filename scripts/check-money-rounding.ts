/**
 * Kontrola peněžního zaokrouhlování ve zdrojích DS.
 * Vlastní: zákaz Math.round a toFixed mimo zdůvodněné výjimky, společný pro obě kontroly.
 * Nesmí: nahrazovat testy výsledků ani měnit zdrojové soubory.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

/** Jediný seznam výjimek; výraz omezuje výjimku na konkrétní nepeněžní výpočet. */
const exceptions = [
  {
    file: "src/lib/column-tones.ts",
    expression: /^Math\.round\(v\*255\)$/,
    reason: "Zaokrouhlení sRGB kanálu na bajt ARGB, nikoli peněžní částka.",
  },
  { file: "src/lib/app-zoom.ts", reason: "Krok a formát zoomu aplikace, nikoli částka." },
  {
    file: "src/lib/mock/accounting.ts",
    reason: "Generátor ukázkových dat, nikoli peněžní výpočet.",
  },
  { file: "src/lib/mock/matching.ts", reason: "Nedistribuovaná ukázková data párování." },
  {
    file: "src/lib/format.ts",
    expression: /^Math\.abs\(n\)\.toFixed\(decimals\)$/,
    reason: "Pouze formátování výstupu na text.",
  },
  {
    file: "src/components/ds/accounting/useJournalLayout.ts",
    expression: /^Math\.round\(containerWidth\)$/,
    reason: "Šířka rozložení v px.",
  },
  { file: "src/components/ds/grid/grid-virtual.tsx", reason: "Výška virtuálního řádku v px." },
  {
    file: "src/components/ds/grid/grid-zoom.tsx",
    reason: "Zoom, velikost písma a zobrazení procent zoomu.",
  },
  { file: "src/components/ds/grid/grid-auto-zoom.ts", reason: "Krok automatického zoomu." },
  {
    file: "src/components/ds/grid/grid-columns.tsx",
    expression: /^Math\.round\(width\)$/,
    reason: "Šířka sloupce v px.",
  },
  { file: "src/components/ds/grid/grid-column-resize.tsx", reason: "Tažení šířky sloupce v px." },
];

/** Zdroj → porušení s pozicí; komentáře a řetězce nejsou volání funkce. */
export function moneyRoundingViolations(source: string, file: string): string[] {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const violations: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const call = node.expression;
      const forbidden =
        call.name.text === "toFixed" ||
        (call.name.text === "round" && call.expression.getText(ast) === "Math");
      const expression = node.getText(ast).replace(/\s+/g, "");
      const allowed = exceptions.some(
        (entry) => entry.file === file && (!entry.expression || entry.expression.test(expression)),
      );
      if (forbidden && !allowed) {
        const position = ast.getLineAndCharacterOfPosition(node.getStart(ast));
        violations.push(`${file}:${position.line + 1}: ${node.getText(ast)}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return violations;
}

if (import.meta.main) {
  const roots = ["src/components/ds/accounting", "src/components/ds/grid", "src/lib"];
  const files = roots.flatMap((root) =>
    readdirSync(root, { recursive: true })
      .map(String)
      .filter((name) => /\.tsx?$/.test(name))
      .map((name) => join(root, name)),
  );
  const violations = files.flatMap((file) =>
    moneyRoundingViolations(readFileSync(file, "utf8"), file),
  );
  if (violations.length) {
    console.error(`Zakázané peněžní zaokrouhlování:\n${violations.join("\n")}`);
    process.exitCode = 1;
  } else
    console.log(
      `Peněžní zaokrouhlování OK (${files.length} souborů; ${exceptions.length} zdůvodněných výjimek).`,
    );
}
