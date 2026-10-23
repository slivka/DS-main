/** Ukázka rozděleného tlačítka · vlastní demo stav · nesmí se distribuovat aplikacím. */
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { SplitButton } from "../ds";
import { DropdownMenuItem } from "../ui/dropdown-menu";

/** Primární, obrysová, s ikonou a zakázaná varianta. */
export function SplitButtonShowcase() {
  const [last, setLast] = useState("—");
  const items = (name: string) => (
    <>
      <DropdownMenuItem onSelect={() => setLast(`${name}: prázdný doklad`)}>
        Prázdný doklad
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setLast(`${name}: ze vzoru`)}>Ze vzoru</DropdownMenuItem>
    </>
  );
  return (
    <div data-testid="split-button-showcase" className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <SplitButton
          icon={<ArrowDownLeft className="size-4" />}
          label="Příjem"
          actionName="Příjem"
          onClick={() => setLast("Příjem")}
          menu={items("Příjem")}
        />
        <SplitButton
          icon={<ArrowUpRight className="size-4" />}
          label="Výdaj"
          actionName="Výdaj"
          onClick={() => setLast("Výdaj")}
          menu={items("Výdaj")}
        />
        <SplitButton
          variant="outline"
          label="Odečet zálohy"
          actionName="Odečet zálohy"
          onClick={() => setLast("Odečet zálohy")}
          menu={items("Odečet")}
        />
        <SplitButton
          label="Příjem"
          actionName="Příjem"
          onClick={() => undefined}
          menu={items("Příjem")}
          disabled
          disabledReason="Období je uzavřené."
        />
        <SplitButton
          variant="outline"
          label="Odečet zálohy"
          actionName="Odečet zálohy"
          onClick={() => undefined}
          menu={items("Odečet")}
          disabled
        />
      </div>
      <p className="text-sm text-muted-foreground">Poslední akce: {last}</p>
    </div>
  );
}
