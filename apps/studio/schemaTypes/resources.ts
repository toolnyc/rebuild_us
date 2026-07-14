import { defineType, defineField } from "sanity";

const SECTIONS = [
  { title: "Disaster Tipsheets", value: "disaster-tipsheets" },
  { title: "For Survivors & Our Communities", value: "survivors-communities" },
  { title: "FEMA & Government Programs", value: "fema-government" },
  { title: "Insurance", value: "insurance" },
];

export const resourceGuide = defineType({
  name: "resourceGuide",
  title: "Resource Guide",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "section",
      title: "Section",
      type: "string",
      options: { list: SECTIONS, layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "file",
      title: "PDF file",
      type: "file",
      options: { accept: ".pdf" },
    }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
  orderings: [
    {
      title: "Section, then order",
      name: "sectionOrder",
      by: [
        { field: "section", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: { select: { title: "title", subtitle: "section" } },
});

export const resourceVideo = defineType({
  name: "resourceVideo",
  title: "Resource Video",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "youtubeUrl" } },
});
