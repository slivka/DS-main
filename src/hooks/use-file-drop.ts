/** Přetažení souborů · vlastní validaci a DOM posluchače · nesmí soubory nahrávat. */
import { useEffect, useRef, useState, type RefObject } from "react";
/** Odmítnutý soubor s každým porušeným pravidlem. */
export interface RejectedFile {
  /** Původní soubor. */
  file: File;
  /** Důvody odmítnutí. */
  reasons: ("type" | "size")[];
}
/** Výsledek validace dávky souborů. */
export interface FileDropResult {
  /** Přijaté soubory. */
  files: File[];
  /** Odmítnuté soubory. */
  rejected: RejectedFile[];
}
/** Možnosti přetažení. */
export interface FileDropOptions {
  /** MIME typy, wildcard nebo přípony s tečkou. */
  accept: readonly string[];
  /** Maximální velikost v bytech. */
  maxSize: number;
  /** Výsledek dávky včetně odmítnutých souborů. */
  onFiles: (files: File[], rejected: RejectedFile[]) => void;
  /** Přetažení je nepovolené. */
  disabled?: boolean;
}
/** Jediná validace pro výběr i přetažení. */
export function validateFiles(
  files: readonly File[],
  accept: readonly string[],
  maxSize: number,
): FileDropResult {
  const accepted: File[] = [];
  const rejected: RejectedFile[] = [];
  for (const file of files) {
    const reasons: RejectedFile["reasons"] = [];
    const allowed =
      accept.length === 0 ||
      accept.some((entry) => {
        const value = entry.toLowerCase();
        if (value.startsWith(".")) return file.name.toLowerCase().endsWith(value);
        if (value.endsWith("/*")) return file.type.toLowerCase().startsWith(value.slice(0, -1));
        return file.type.toLowerCase() === value;
      });
    if (!allowed) reasons.push("type");
    if (file.size > maxSize) reasons.push("size");
    if (reasons.length) rejected.push({ file, reasons });
    else accepted.push(file);
  }
  return { files: accepted, rejected };
}
/** Přijímá více souborů; vnořené dragenter/dragleave nepřerušují zvýraznění. */
export function useFileDrop(ref: RefObject<HTMLElement | null>, options: FileDropOptions) {
  const latest = useRef(options);
  latest.current = options;
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let depth = 0;
    const containsFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes("Files");
    const enter = (event: DragEvent) => {
      if (!containsFiles(event)) return;
      event.preventDefault();
      depth += 1;
      if (!latest.current.disabled) setDragging(true);
    };
    const leave = () => {
      depth = Math.max(0, depth - 1);
      if (!depth) setDragging(false);
    };
    const over = (event: DragEvent) => {
      if (containsFiles(event)) event.preventDefault();
    };
    const drop = (event: DragEvent) => {
      if (!containsFiles(event)) return;
      event.preventDefault();
      event.stopPropagation();
      depth = 0;
      setDragging(false);
      if (latest.current.disabled) return;
      const { accept, maxSize, onFiles } = latest.current;
      const result = validateFiles(Array.from(event.dataTransfer?.files ?? []), accept, maxSize);
      onFiles(result.files, result.rejected);
    };
    node.addEventListener("dragenter", enter);
    node.addEventListener("dragleave", leave);
    node.addEventListener("dragover", over);
    node.addEventListener("drop", drop);
    return () => {
      node.removeEventListener("dragenter", enter);
      node.removeEventListener("dragleave", leave);
      node.removeEventListener("dragover", over);
      node.removeEventListener("drop", drop);
    };
  }, [ref]);
  return { dragging };
}
