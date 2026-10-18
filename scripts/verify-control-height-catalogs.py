"""Aditivní kontrola čtyř katalogových vstupů proti začátku kola 2.107.0."""
import json
import re
import subprocess
from pathlib import Path

BASE = "8a53e95"

def original(path):
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], text=True)

path = ".lovable/design-system.json"
old = json.loads(original(path))
new = json.loads(Path(path).read_text())
old_by_name = {c["name"]: c for c in old["components"]}
new_by_name = {c["name"]: c for c in new["components"]}
assert len(new_by_name) == len(new["components"]), "Duplicitní názvy"
assert old_by_name.keys() <= new_by_name.keys(), "Ubyl název komponenty"
for name, component in old_by_name.items():
    current = new_by_name[name]
    assert {p["name"] for p in component.get("props", [])} <= {
        p["name"] for p in current.get("props", [])
    }, f"Ubyl prop: {name}"
    # Jen výslovně zastaralý text nápovědy/zalomení byl nahrazen.
    if name != "CheckboxField":
        assert component.get("usage", "") in current.get("usage", ""), name
    for prop in component.get("props", []):
        updated = next(p for p in current["props"] if p["name"] == prop["name"])
        assert set(prop.get("values", [])) <= set(updated.get("values", [])), name
    for example in component.get("examples", []):
        if name == "CheckboxField" and example["label"] == "Víceřádkový popisek s nápovědou":
            continue
        assert example in current.get("examples", []), f"Ubyl příklad: {name}"
    assert set(component.get("antipatterns", [])) <= set(current.get("antipatterns", [])), name
print(f"JSON: {len(old_by_name)} → {len(new_by_name)} komponent; "
      f"{sum(len(c.get('props', [])) for c in old['components'])} → "
      f"{sum(len(c.get('props', [])) for c in new['components'])} props; bez ztrát")
for path in ["src/index.ts", "src/components/ds/index.ts", "components.md"]:
    before, after = original(path), Path(path).read_text()
    if path.endswith("index.ts"):
        exports = lambda text: set(re.findall(r"export\s+(?:\*[^;]*|\{[^;]*?\}[^;]*);", text, re.S))
        assert exports(before) <= exports(after), f"Ubyl export: {path}"
    else:
        headings = lambda text: set(re.findall(r"^#{2,3} .+$", text, re.M))
        assert headings(before) <= headings(after), "Ubyla katalogová sekce"
    print(f"{path}: {len(before.encode())} → {len(after.encode())} B; bez ztrát")
assert new["meta"]["version"] == json.loads(Path("package.json").read_text())["version"] == "2.106.0"
