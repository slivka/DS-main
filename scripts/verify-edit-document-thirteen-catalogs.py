"""Kontrola všech katalogových objektů a sekcí proti vydanému zdroji 98810718."""
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

BASE = "98810718"
TOUCHED = {
    "CounterpartyInputField", "PaymentOrderAccountField", "SuggestInput",
    "DateField", "DocumentForm", "JournalLinesEditor",
}
ADDED = {"FieldToggleButton", "BankStatementForm"}


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
assert len(old) == 426 and len(new) == 428
assert not old.keys() - new.keys()
assert new.keys() - old.keys() == ADDED
changed = {name for name in old if old[name] != new[name]}
assert changed == TOUCHED, changed
print(f"JSON: 426 → 428; odstraněné 0; nové {sorted(ADDED)}")
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
    assert count == 428, (path, count)
    print(f"{path}: 426 → {count}; odstraněné sekce 0; změněné {len(modified)}; nové {len(added)}")
old_manifest = old_json["meta"]["source_manifest"]
new_manifest = new_json["meta"]["source_manifest"]
assert not old_manifest.keys() - new_manifest.keys()
assert old_manifest["#enrichment"] == new_manifest["#enrichment"]
changed_files = set(subprocess.check_output(
    ["git", "diff", "--name-only", BASE]).decode().splitlines())
modified_manifest = {key for key in old_manifest if old_manifest[key] != new_manifest[key]}
assert modified_manifest <= changed_files, modified_manifest - changed_files
assert new_manifest.keys() - old_manifest.keys() <= changed_files
for key in ["assets", "constraints"]:
    assert old_json[key] == new_json[key], key
print(f"source_manifest: {len(old_manifest)} → {len(new_manifest)}; odstraněné 0; #enrichment zachován")
print("DocumentActionBar a všechny neuvedené objekty i sekce zůstaly bajtově shodné.")
