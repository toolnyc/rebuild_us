import { hasProtectedTerms, protectedTerms } from "../glossary";

interface Span {
  key: string;
  position: number[];
  text: string;
}

interface DeepLResponse {
  translations: { text: string }[];
}

export async function translateSpans(spans: Span[], apiKey = process.env.DEEPL_API_KEY): Promise<string[]> {
  if (!apiKey) throw new Error("DEEPL_API_KEY is required to generate translations.");
  const response = await fetch("https://api.deepl.com/v2/translate", {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: spans.map((span) => span.text),
      target_lang: "ES",
      tag_handling: "xml",
      ignore_tags: protectedTerms.join(","),
    }),
  });
  if (!response.ok) throw new Error(`DeepL translation failed: ${response.status}`);
  const body = (await response.json()) as DeepLResponse;
  if (body.translations.length !== spans.length) throw new Error("DeepL returned an incomplete translation batch.");
  const translations = body.translations.map((item) => item.text);
  spans.forEach((span, index) => {
    if (!hasProtectedTerms(span.text, translations[index])) {
      throw new Error(`DeepL changed a protected term in ${span.key}.`);
    }
  });
  return translations;
}

export function portableTextSpans(value: Record<string, unknown>[], key: string): Span[] {
  const spans: Span[] = [];
  value.forEach((block, blockIndex) => {
    if (!Array.isArray(block.children)) return;
    (block.children as Record<string, unknown>[]).forEach((child, childIndex) => {
      if (typeof child.text === "string" && child.text) {
        spans.push({ key, position: [blockIndex, childIndex], text: child.text });
      }
    });
  });
  return spans;
}

export function applyPortableTextTranslations(
  value: Record<string, unknown>[],
  spans: Span[],
  translations: string[],
): Record<string, unknown>[] {
  const clone = structuredClone(value);
  spans.forEach((span, index) => {
    const [blockIndex, childIndex] = span.position;
    ((clone[blockIndex].children as Record<string, unknown[]>)[childIndex] as Record<string, unknown>).text =
      translations[index];
  });
  return clone;
}
