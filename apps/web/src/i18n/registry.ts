import type { MessageKind, PortableTextBlock } from "./contract";

export interface TranslatableMessage {
  key: string;
  kind: MessageKind;
  value: string | PortableTextBlock[];
  owner: string;
  path: string[];
}

export interface ContentOwner {
  id: string;
  route: "/" | "/resources" | "/privacy";
  messages: TranslatableMessage[];
}

export type Content = Record<string, unknown>;

export type TranslationSource = {
  siteSettings?: Content;
  splash?: Content;
  resourcesPage?: Content;
  privacyPage?: Content;
  guides?: Content[];
  videos?: Content[];
};
