"""Kontrola všech katalogových objektů a sekcí proti vydanému zdroji 98810718."""
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

BASE = "98810718"
TOUCHED = {
    "CounterpartyInputField", "PaymentOrderAccountField", "SuggestInput",
    "DateField", "DocumentForm", "JournalLinesEditor", "RecordActionBar",
}
ADDED = {"FieldToggleButton", "BankStatementForm", "IdentityLine"}


def baseline(path):
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"]).decode()


def unique_keys(pairs):
    result = {}
    for key, value in pairs:
        assert key not in result, f"Duplicitní JSON klíč: {key}"
        result[key] = value
    return result


def raw_components(text):
    start = re.search(r'"components"\s*:\s*\[', text).end()
    decoder = json.JSONDecoder()
    result = {}
    while True:
        while text[start].isspace() or text[start] == ",":
            start += 1
        if text[start] == "]":
            return result
        value, end = decoder.raw_decode(text, start)
        assert value["name"] not in result
        result[value["name"]] = text[start:end].encode()
        start = end


def sections(text):
    matches = list(re.finditer(r"^#{2,3} .+$", text, re.M))
    result = {"<preamble>": text[:matches[0].start()].encode()}
    seen = Counter()
    for index, match in enumerate(matches):
        heading = match.group()
        seen[heading] += 1
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        result[f"{heading} [{seen[heading]}]"] = text[match.start():end].encode()
    return result


path = ".lovable/design-system.json"
text = Path(path).read_text()
new_json = json.loads(text, object_pairs_hook=unique_keys)
old_json = json.loads(baseline(path))
old = raw_components(baseline(path))
new = raw_components(text)
assert len(old) == 426 and len(new) == 429
assert not old.keys() - new.keys()
assert new.keys() - old.keys() == ADDED
changed = {name for name in old if old[name] != new[name]}
assert changed == TOUCHED, changed
print(f"JSON: 426 → 429; odstraněné 0; nové {sorted(ADDED)}")
print(f"Změněné pouze {sorted(changed)}; bajtově shodných {426-len(changed)}")
for path, index in [
    ("components.md", "## Index veřejných komponent [1]"),
    (".lovable/rules/components.md", None),
    (".lovable/rules/library-guidelines.md", "## Components [1]"),
]:
    old = sections(baseline(path))
    new = sections(Path(path).read_text())
    assert not old.keys() - new.keys(), (path, old.keys() - new.keys())
    modified = {key for key in old if old[key] != new[key]}
    added = new.keys() - old.keys()
    if index:
        assert modified == {index}, (path, modified)
        count = len(re.findall(r"`([A-Z][A-Za-z0-9]+)`", new[index].decode()))
        allowed = {"### FieldToggleButton / BankStatementForm 2.100.0 – Edit dokladu 13 [1]"}
        assert added == (allowed if path == "components.md" else set()), (path, added)
    else:
        assert modified == {f"### {name} [1]" for name in TOUCHED}, modified
        assert added == {f"### {name} [1]" for name in ADDED}, added
        count = sum(key.startswith("### ") for key in new)
    assert count == 429, (path, count)
    print(f"{path}: 426 → {count}; odstraněné sekce 0; změněné {len(modified)}; nové {len(added)}")
old_manifest = old_json["meta"]["source_manifest"]
new_manifest = new_json["meta"]["source_manifest"]
assert not old_manifest.keys() - new_manifest.keys()
assert old_manifest["#enrichment"] == new_manifest["#enrichment"]
changed_files = set(subprocess.check_output(
    ["git", "diff", "--name-only", BASE]).decode().splitlines())
modified_manifest = {key for key in old_manifest if old_manifest[key] != new_manifest[key]}
assert modified_manifest <= changed_files, modified_manifest - changed_files
assert all(Path(key).is_file() for key in new_manifest.keys() - old_manifest.keys())
for key in ["assets", "constraints"]:
    assert old_json[key] == new_json[key], key
print(f"source_manifest: {len(old_manifest)} → {len(new_manifest)}; odstraněné 0; #enrichment zachován")
print("DocumentActionBar a všechny neuvedené objekty i sekce zůstaly bajtově shodné.")

# Každý řádek tabulky props porovnáme s bází; existující props nesmí zmizet.
def prop_rows(section):
    return {match.group(1): match.group(0) for match in re.finditer(
        r"^\| `([^`]+)` \|.*$", section.decode(), re.M)}
old_sections = sections(baseline(".lovable/rules/components.md"))
new_sections = sections(Path(".lovable/rules/components.md").read_text())
changed_rows = []
old_count = new_count = 0
for section, content in old_sections.items():
    old_rows, new_rows = prop_rows(content), prop_rows(new_sections[section])
    old_count += len(old_rows)
    new_count += len(new_rows)
    assert not old_rows.keys() - new_rows.keys(), (section, "Odstraněné props")
    for name, row in old_rows.items():
        if row != new_rows[name]:
            changed_rows.append((section, name, row, new_rows[name]))
            assert section in {"### DateField [1]", "### SuggestInput [1]"}, changed_rows
for section in new_sections.keys() - old_sections.keys():
    new_count += len(prop_rows(new_sections[section]))
assert {(section, name) for section, name, _, _ in changed_rows} == {
    ("### DateField [1]", "className"),
    ("### SuggestInput [1]", "enabledLabel"),
    ("### SuggestInput [1]", "disabledLabel"),
}, changed_rows
for section, name, old_row, new_row in changed_rows:
    print(f"Změna props: {section} {name}: {old_row} → {new_row}")
# Výchozí hodnoty musí odpovídat zdroji i zachované bázi.
assert "| `warningDisplay` | below · indicator | `below` |" in new_sections["### DateField [1]"].decode()
assert "| `debounceMs` | number | `200` |" in new_sections["### SuggestInput [1]"].decode()
print(f"Props tabulek: {old_count} → {new_count}; původní řádky změněné {len(changed_rows)}, odstraněné 0; nové {new_count-old_count}")
print(f"meta.version báze: {old_json['meta']['version']}; připravená: {new_json['meta']['version']}")
