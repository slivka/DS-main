"""Bajtová kontrola všech katalogových objektů a sekcí proti vydání."""
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

BASE = "b27379e4"
ALLOWED = {
    "Input", "Field", "BankAccountField", "PaymentOrderAccountField", "DocumentForm",
    "SelectTrigger", "OptionSelect", "Textarea", "DecimalInput",
}


def baseline(path):
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"]).decode()


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
        result[value["name"]] = text[start:end].encode()
        start = end


def sections(text):
    matches = list(re.finditer(r"^#{2,3} .+$", text, re.M))
    result = {"<preamble>": text[:matches[0].start()].encode()}
    seen = Counter()
    for index, match in enumerate(matches):
        heading = match.group()
        seen[heading] += 1
        key = f"{heading} [{seen[heading]}]"
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        result[key] = text[match.start():end].encode()
    return result


path = ".lovable/design-system.json"
old = raw_components(baseline(path))
new = raw_components(Path(path).read_text())
assert old.keys() == new.keys() and len(new) == 426
changed = sorted(name for name in old if old[name] != new[name])
assert set(changed) <= ALLOWED, changed
print(f"JSON: 426; změněné: {', '.join(changed)}; shodné: {426 - len(changed)}")
for path in ["components.md", ".lovable/rules/components.md", ".lovable/rules/library-guidelines.md"]:
    old = sections(baseline(path))
    new = sections(Path(path).read_text())
    modified = sorted(key for key in old if old[key] != new.get(key))
    added = sorted(new.keys() - old.keys())
    removed = sorted(old.keys() - new.keys())
    assert not removed, removed
    if path == "components.md":
        assert set(modified) <= {"### DocumentForm 2.31.0 [1]"}
        assert not added
        count = len(re.findall(r"`([A-Z][A-Za-z0-9]+)`", new["## Index veřejných komponent [1]"].decode()))
    elif path.endswith("/components.md"):
        assert all(key.split(" [")[0][4:] in ALLOWED for key in modified)
        assert not added
        count = sum(key.startswith("### ") for key in new)
    else:
        assert set(modified) <= {"## Edit dokladu 12 (2.96.0) [1]"}
        assert all(key.startswith("## Edit dokladu 12") for key in added)
        count = len(re.findall(r"`([A-Z][A-Za-z0-9]+)`", new["## Components [1]"].decode()))
    assert count == 426, (path, count)
    print(f"{path}: {count}; všech sekcí: {len(new)-1}; změněné: {modified}; nové: {added}")
assert json.loads(baseline('.lovable/design-system.json'))['meta']['source_manifest']['#enrichment'] == json.loads(Path('.lovable/design-system.json').read_text())['meta']['source_manifest']['#enrichment']
print("DocumentActionBar i všechny neuvedené sekce a JSON objekty jsou bajtově shodné; #enrichment zachován.")
