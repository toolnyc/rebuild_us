import type { TranslationTable } from "./contract";
import { resolveMessage } from "./resolve";
import { translationRegistry } from "./registry.mjs";
import type { ContentOwner } from "./registry";

type Content = Record<string, unknown>;

function setAtPath(target: Content, path: string[], value: unknown) {
  let cursor: Content | unknown[] = target;
  for (const segment of path.slice(0, -1)) {
    const key: string | number = Array.isArray(cursor) ? Number(segment) : segment;
    cursor = (cursor as Record<string | number, Content | unknown[]>)[key];
  }
  const last = path.at(-1)!;
  (cursor as Record<string | number, unknown>)[Array.isArray(cursor) ? Number(last) : last] = value;
}

export function localizedContent(
  source: {
    siteSettings?: Content;
    splash?: Content;
    resourcesPage?: Content;
    privacyPage?: Content;
    guides?: Content[];
    videos?: Content[];
  },
  generated: TranslationTable,
  overrides: TranslationTable,
) {
  const owners = translationRegistry(source);
  const copies = {
    siteSettings: structuredClone(source.siteSettings ?? {}),
    splash: structuredClone(source.splash ?? {}),
    resourcesPage: structuredClone(source.resourcesPage ?? {}),
    privacyPage: structuredClone(source.privacyPage ?? {}),
    guides: structuredClone(source.guides ?? []),
    videos: structuredClone(source.videos ?? []),
  };
  const included = new Set<string>();

  for (const owner of owners) {
    const destination = destinationFor(owner, copies);
    if (!destination) continue;
    let complete = true;
    for (const message of owner.messages) {
      const result = resolveMessage(message, generated, overrides);
      if (!result.message) {
        complete = false;
        break;
      }
      setAtPath(destination, message.path, result.message.value);
    }
    if (complete) included.add(owner.id);
  }

  return { ...copies, included };
}

function destinationFor(owner: ContentOwner, copies: Record<string, Content | Content[]>): Content | undefined {
  if (owner.id === "site") return copies.siteSettings as Content;
  if (owner.id === "splash") return copies.splash as Content;
  if (owner.id === "resourcesPage") return copies.resourcesPage as Content;
  if (owner.id === "privacyPage") return copies.privacyPage as Content;
  const [kind, id] = owner.id.split(".");
  const list = kind === "guide" ? copies.guides : copies.videos;
  return (list as Content[]).find((item) => item._id === id);
}
