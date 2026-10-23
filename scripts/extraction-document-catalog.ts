/** Návrhy dokladu · vlastní obohacení katalogu · nesmí měnit API ani vydávat. */
interface Component {
  name: string;
  props?: { name: string; type: string }[];
  usage?: string;
  examples?: { label: string; code: string }[];
  antipatterns?: string[];
}
/** Zachová autorské popisy napojení APP při obnově katalogu. */
export function enrichExtractionDocumentCatalog(components: Component[]) {
  for (const name of ["DocumentForm", "JournalLinesEditor"]) {
    const component = components.find((item) => item.name === name);
    if (!component) continue;
    component.props ??= [];
    const props = [
      { name: "rowSuggestions", type: "JournalRowSuggestions" },
      { name: "onSuggestionCleared", type: "(key: string, rowId?: string) => void" },
      ...(name === "DocumentForm"
        ? [{ name: "fieldSuggestions", type: "Partial<Record<string, FieldSuggestion>>" }]
        : []),
    ];
    for (const prop of props)
      if (!component.props.some((item) => item.name === prop.name)) component.props.push(prop);
    const usage =
      " Návrhy vytěžení vlastní APP; onSuggestionCleared hlásí první ruční změnu. Chyba má přednost, F8 zahrnuje hlavičku i buňky. Záporné částky dobropisů se zachovávají na původních stranách.";
    if (!component.usage?.includes("Návrhy vytěžení vlastní APP"))
      component.usage = (component.usage ?? "") + usage;
    const example = {
      label: "Návrhy vytěžení od APP",
      code:
        name === "DocumentForm"
          ? "<DocumentForm {...props} fieldSuggestions={{ dueDate: { source: fileName, uncertain: true } }} rowSuggestions={{ [rowId]: { amount: { source: fileName, uncertain: true } } }} onSuggestionCleared={removeSuggestion} />"
          : "<JournalLinesEditor {...props} rowSuggestions={{ [rowId]: { text: { source: fileName, uncertain: true } } }} onSuggestionCleared={removeSuggestion} />",
    };
    component.examples ??= [];
    if (!component.examples.some((item) => item.label === example.label))
      component.examples.push(example);
    component.antipatterns ??= [];
    const anti =
      "Návrhy nemažte při pouhém otevření pole; záporné částky nepřevádějte na absolutní hodnotu.";
    if (!component.antipatterns.includes(anti)) component.antipatterns.push(anti);
  }
}
