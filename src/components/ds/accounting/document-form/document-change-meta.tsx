/**
 * Metadata poslední změny dokladu.
 * Vlastní pouze prezentaci autora a času změny.
 */
export function DocumentChangeMeta({
  changedBy,
  changedAt,
  changedByLabel,
  changedAtLabel,
}: {
  changedBy?: string;
  changedAt?: string;
  changedByLabel: string;
  changedAtLabel: string;
}) {
  if (!changedBy && !changedAt) return null;
  return (
    <div className="flex flex-wrap justify-end gap-x-4 text-xs text-muted-foreground">
      {changedBy ? <span>{`${changedByLabel}: ${changedBy}`}</span> : null}
      {changedAt ? <span>{`${changedAtLabel}: ${changedAt}`}</span> : null}
    </div>
  );
}
