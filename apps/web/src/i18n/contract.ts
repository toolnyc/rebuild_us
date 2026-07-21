export type MessageKind = "plain" | "richText" | "metadata";
export type PortableTextBlock = Record<string, unknown>;

export interface TranslationMessage {
  key: string;
  kind: MessageKind;
  sourceHash: string;
  value: string | PortableTextBlock[];
  reviewed?: {
    by: string;
    at: string;
  };
}

export interface TranslationTable {
  locale: "es";
  messages: TranslationMessage[];
}

const kinds = new Set<MessageKind>(["plain", "richText", "metadata"]);

export function validateTable(value: unknown, tableName = "table"): TranslationTable {
  if (!isRecord(value) || value.locale !== "es" || !Array.isArray(value.messages)) {
    throw new Error(`${tableName} must contain locale "es" and a messages array.`);
  }

  const keys = new Set<string>();
  const messages = value.messages.map((message, index) => {
    if (!isRecord(message) || typeof message.key !== "string" || !message.key) {
      throw new Error(`${tableName}.messages[${index}] has an invalid key.`);
    }
    if (keys.has(message.key)) throw new Error(`${tableName} contains duplicate key "${message.key}".`);
    keys.add(message.key);
    if (!kinds.has(message.kind as MessageKind)) {
      throw new Error(`${tableName}.messages[${index}] has an invalid kind.`);
    }
    if (typeof message.sourceHash !== "string" || !/^[a-f0-9]{64}$/.test(message.sourceHash)) {
      throw new Error(`${tableName}.messages[${index}] has an invalid source hash.`);
    }
    if (typeof message.value !== "string" && !Array.isArray(message.value)) {
      throw new Error(`${tableName}.messages[${index}] has an invalid value.`);
    }
    if (message.kind === "richText" !== Array.isArray(message.value)) {
      throw new Error(`${tableName}.messages[${index}] kind does not match its value.`);
    }
    return message as unknown as TranslationMessage;
  });

  return { locale: "es", messages };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
