// Spanish copy is editor-managed in Sanity `*Es` fields (ADR-0008). Fall back to
// English for anything not yet translated so the page never breaks.
export const es = (spanish: unknown, english: unknown) => spanish ?? english;

// Solidarity Tech forms carry their own Spanish translations behind ?locale=es.
export const esForm = (src?: string) =>
  src ? `${src}${src.includes("?") ? "&" : "?"}locale=es` : src;
