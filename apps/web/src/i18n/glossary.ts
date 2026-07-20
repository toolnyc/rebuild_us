export const protectedTerms = ["Rebuild", "Claims Ready", "ClaimReady"] as const;

export function hasProtectedTerms(source: string, translation: string): boolean {
  return protectedTerms.every(
    (term) => !source.includes(term) || translation.includes(term),
  );
}
