import { defineType, defineField } from "sanity";
import { SlugWithCopyLinks } from "../components/SlugWithCopyLinks";

// Reserved first path segments that would collide with existing routes.
const RESERVED_SLUGS = ["resources", "privacy", "es", "sitemap.xml", "robots.txt"];

export const sharePage = defineType({
  name: "sharePage",
  title: "Share Page (PDF)",
  type: "document",
  description:
    "Unlisted full-screen PDF pages at www.rebuild.us/share/<slug> (Español: www.rebuild.us/es/share/<slug>). Absent from nav and sitemap; share by direct link.",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      description: "Page lives at www.rebuild.us/share/<slug>.",
      type: "slug",
      options: { source: "title" },
      components: { input: SlugWithCopyLinks },
      validation: (r) =>
        r.required().custom(async (slug, context) => {
          if (!slug?.current) return true;
          if (RESERVED_SLUGS.includes(slug.current)) {
            return `"${slug.current}" is reserved by an existing route`;
          }
          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2024-01-01" });
          const id = document?._id.replace(/^drafts\./, "");
          const duplicate = await client.fetch(
            `*[_type == "sharePage" && slug.current == $slug && !(_id in [$id, $draftId])][0]._id`,
            { slug: slug.current, id, draftId: `drafts.${id}` },
          );
          return duplicate ? "Another share page already uses this slug" : true;
        }),
    }),
    defineField({
      name: "file",
      title: "PDF file",
      type: "file",
      options: { accept: ".pdf" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleEs",
      title: "Title (Español)",
      type: "string",
    }),
    defineField({
      name: "fileEs",
      title: "PDF file (Español)",
      description:
        "Optional. Shown at www.rebuild.us/es/share/<slug>; falls back to the English PDF when empty.",
      type: "file",
      options: { accept: ".pdf" },
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({ title, subtitle: `/share/${slug}` }),
  },
});
