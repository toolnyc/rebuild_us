import { defineField, defineType } from "sanity";

const message = {
  type: "object",
  fields: [
    defineField({ name: "key", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "kind", type: "string", options: { list: ["plain", "richText", "metadata"] }, validation: (Rule) => Rule.required() }),
    defineField({ name: "english", type: "text", validation: (Rule) => Rule.required() }),
    defineField({ name: "sourceHash", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "generatedSpanish", type: "text", validation: (Rule) => Rule.required() }),
    defineField({ name: "reviewedSpanish", type: "text" }),
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
