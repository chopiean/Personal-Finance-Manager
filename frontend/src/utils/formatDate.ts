// src/utils/formatDate.ts

/**
 * Formats an ISO date ("2026-11-16") as dd-mm-yyyy ("16-11-2026").
 * Parses the string directly to avoid timezone shifts from new Date().
 * Returns the input unchanged if it isn't an ISO date.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, year, month, day] = m;
  return `${day}-${month}-${year}`;
}
