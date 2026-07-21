import { defineField, defineType } from "sanity";

const isPlain = ({ parent }: { parent?: { kind?: string } }) => parent?.kind !== "plain";
const isRichText = ({ parent }: { parent?: { kind?: string } }) => parent?.kind !== "richText";

const highlightDecorator = {
  title: "Highlight",
  value: "highlight",
};

const richText = (name: string, title: string, readOnly = false) =>
  defineField({
    name,
    title,
    type: "array",
    readOnly,
    hidden: isRichText,
    of: [
      {
        type: "block",
        styles: [{ title: "Normal", value: "normal" }],
        lists: [],
        marks: {
          decorators: [
            { title: "Strong", value: "strong" },
            { title: "Emphasis", value: "em" },
            highlightDecorator,
          ],
          annotations: [
            {
              name: "link",
              type: "object",
              title: "Link",
              fields: [{ name: "href", type: "url", title: "URL" }],
            },
          ],
        },
      },
      { type: "image" },
    ],
  });

const message = {
  type: "object",
  fields: [
    defineField({ name: "key", type: "string", readOnly: true, validation: (Rule) => Rule.required() }),
    defineField({ name: "kind", type: "string", readOnly: true, options: { list: ["plain", "richText", "metadata"] }, validation: (Rule) => Rule.required() }),
    defineField({ name: "english", type: "text", readOnly: true, hidden: isPlain }),
    richText("englishRichText", "English", true),
    defineField({ name: "sourceHash", type: "string", readOnly: true, validation: (Rule) => Rule.required() }),
    defineField({ name: "generatedSpanish", type: "text", readOnly: true, hidden: isPlain }),
    richText("generatedSpanishRichText", "Generated Spanish", true),
    defineField({ name: "reviewedSpanish", type: "text", hidden: isPlain }),
    richText("reviewedSpanishRichText", "Reviewed Spanish"),
  ],
};

export const translationReview = defineType({
  name: "translationReview",
  title: "Translation Review",
  type: "document",
  fields: [
    defineField({ name: "locale", type: "string", readOnly: true, initialValue: "es", validation: (Rule) => Rule.required().valid("es") }),
    defineField({
      name: "owner",
      type: "object",
      fields: [
        defineField({ name: "id", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "displayName", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "route", type: "string", validation: (Rule) => Rule.required() }),
      ],
    }),
    defineField({ name: "messages", type: "array", of: [message], validation: (Rule) => Rule.required().min(1) }),
    defineField({ name: "status", type: "string", options: { list: ["pending", "approved", "stale", "applied"] }, initialValue: "pending", validation: (Rule) => Rule.required() }),
    defineField({
      name: "generation",
      type: "object",
      fields: [
        defineField({ name: "provider", type: "string" }),
        defineField({ name: "model", type: "string" }),
        defineField({ name: "generatedAt", type: "datetime" }),
        defineField({ name: "tableRevision", type: "string" }),
      ],
    }),
    defineField({
      name: "approval",
      type: "object",
      fields: [defineField({ name: "reviewer", type: "string" }), defineField({ name: "approvedAt", type: "datetime" })],
    }),
    defineField({ name: "appliedCommit", type: "string" }),
  ],
});
