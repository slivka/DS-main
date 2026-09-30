import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TooltipProvider } from "../../src/components/ui/tooltip";
import { SuggestInput } from "../../src/components/ds/form/suggest-input";

describe("SuggestInput 2.32.0", () => {
  it("zpřístupní stav našeptávače a zachová omezení vstupu", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <SuggestInput
          value="Doprava"
          onChange={() => {}}
          loadSuggestions={async () => ["Doprava zásilky"]}
          enabled
          onEnabledChange={() => {}}
          maxLength={200}
        />
      </TooltipProvider>,
    );
    expect(html).toContain("Našeptávač z předchozích dokladů – zapnuto");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('maxLength="200"');
  });
});
