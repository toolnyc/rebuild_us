import { defineType, defineField } from "sanity";

const visibleField = defineField({
  name: "visible",
  title: "Visible",
  type: "boolean",
  initialValue: false,
});

const highlightDecorator = {
  title: "Highlight",
  value: "highlight",
};

const richText = (name: string, title: string, group?: string) =>
  defineField({
    name,
    title,
    type: "array",
    ...(group ? { group } : {}),
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
    ],
  });

export const splashPage = defineType({
  name: "splashPage",
  title: "Splash Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "about", title: "About" },
    { name: "founding", title: "Founding CTA" },
    { name: "whyJoin", title: "Why Join" },
    { name: "resources", title: "Resources" },
    { name: "getInvolved", title: "Get Involved" },
    { name: "es", title: "Español" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Splash",
    }),
    visibleField,

    // Hero
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline (leading)",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroHeadlineAccent",
      title: "Hero headline accent (italic)",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroSubcopy",
      title: "Hero subcopy",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroImageCaption",
      title: "Hero image caption",
      type: "string",
      group: "hero",
    }),

    // About
    defineField({
      name: "aboutLabel",
      title: "About eyebrow label",
      type: "string",
      group: "about",
    }),
    richText("aboutStatement", "About statement"),
    defineField({
      name: "aboutSupport",
      title: "About supporting paragraph",
      type: "string",
      group: "about",
    }),

    // Founding CTA
    defineField({
      name: "foundingLabel",
      title: "Founding eyebrow label",
      type: "string",
      group: "founding",
    }),
    defineField({
      name: "foundingCtaHeadline",
      title: "Founding CTA headline",
      type: "string",
      group: "founding",
    }),
    defineField({
      name: "foundingCtaSubcopy",
      title: "Founding CTA subcopy",
      type: "string",
      group: "founding",
    }),

    // Why Join
    defineField({
      name: "benefitsLabel",
      title: "Why Join eyebrow label",
      type: "string",
      group: "whyJoin",
    }),
    defineField({
      name: "whyJoinBgImage",
      title: "Why Join background image",
      type: "image",
      group: "whyJoin",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "whyJoinColumns",
      title: "Why Join rows",
      type: "array",
      group: "whyJoin",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "body", title: "Body", type: "text", rows: 4 },
            { name: "titleEs", title: "Title (Español)", type: "string" },
            { name: "bodyEs", title: "Body (Español)", type: "text", rows: 4 },
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),

    // Resources
    defineField({
      name: "resourcesLabel",
      title: "Resources eyebrow label",
      type: "string",
      group: "resources",
    }),
    defineField({
      name: "resourcesHeadline",
      title: "Resources headline",
      type: "string",
      group: "resources",
    }),
    richText("resourcesSubcopy", "Resources subcopy"),
    defineField({
      name: "resourcesLeftCopy",
      title: "Resources intro copy",
      type: "text",
      rows: 3,
      group: "resources",
    }),
    defineField({
      name: "featuredResources",
      title: "Featured resource guides",
      description: "Ordered guides shown on the splash. Order matters.",
      type: "array",
      group: "resources",
      of: [{ type: "reference", to: [{ type: "resourceGuide" }] }],
    }),

    // Get Involved
    defineField({
      name: "getInvolvedCopy",
      title: "Get Involved copy",
      type: "string",
      group: "getInvolved",
    }),
    defineField({
      name: "getInvolvedFinePrint",
      title: "Get Involved fine print",
      type: "string",
      group: "getInvolved",
    }),

    // Español
    ...[
      ["heroHeadlineEs", "Hero headline (leading) (Español)"],
      ["heroHeadlineAccentEs", "Hero headline accent (italic) (Español)"],
      ["heroSubcopyEs", "Hero subcopy (Español)"],
      ["heroImageCaptionEs", "Hero image caption (Español)"],
      ["aboutLabelEs", "About eyebrow label (Español)"],
      ["aboutSupportEs", "About supporting paragraph (Español)"],
      ["foundingLabelEs", "Founding eyebrow label (Español)"],
      ["foundingCtaHeadlineEs", "Founding CTA headline (Español)"],
      ["foundingCtaSubcopyEs", "Founding CTA subcopy (Español)"],
      ["benefitsLabelEs", "Why Join eyebrow label (Español)"],
      ["resourcesLabelEs", "Resources eyebrow label (Español)"],
      ["resourcesHeadlineEs", "Resources headline (Español)"],
      ["getInvolvedCopyEs", "Get Involved copy (Español)"],
      ["getInvolvedFinePrintEs", "Get Involved fine print (Español)"],
    ].map(([name, title]) =>
      defineField({ name, title, type: "string", group: "es" }),
    ),
    defineField({
      name: "resourcesLeftCopyEs",
      title: "Resources intro copy (Español)",
      type: "text",
      rows: 3,
      group: "es",
    }),
    richText("aboutStatementEs", "About statement (Español)", "es"),
    richText("resourcesSubcopyEs", "Resources subcopy (Español)", "es"),
  ],
  __experimental_actions: ["update", "publish"],
});

export const privacyPage = defineType({
  name: "privacyPage",
  title: "Privacy",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Privacy Policy",
    }),
    visibleField,
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "titleEs",
      title: "Title (Español)",
      type: "string",
    }),
    defineField({
      name: "bodyEs",
      title: "Body (Español)",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  __experimental_actions: ["update", "publish"],
});

const stubPage = (name: string, title: string) =>
  defineType({
    name,
    title,
    type: "document",
    fields: [
      defineField({
        name: "title",
        title: "Title",
        type: "string",
        initialValue: title,
      }),
      visibleField,
    ],
    __experimental_actions: ["update", "publish"],
  });

export const resourcesPage = defineType({
  name: "resourcesPage",
  title: "Resources",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Resources",
    }),
    visibleField,
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
      initialValue: "Resources",
    }),
    defineField({
      name: "heroSubcopy",
      title: "Hero subcopy",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "writtenGuidesHeading",
      title: "Written Guides heading",
      type: "string",
      initialValue: "Written Guides",
    }),
    defineField({
      name: "writtenGuidesSubcopy",
      title: "Written Guides subcopy",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "videoLibraryHeading",
      title: "Video Library heading",
      type: "string",
      initialValue: "Video Library",
    }),
    defineField({
      name: "newsletterCopy",
      title: "Newsletter copy",
      type: "string",
    }),
    defineField({
      name: "newsletterFinePrint",
      title: "Newsletter fine print",
      type: "string",
    }),

    // Español
    ...[
      ["titleEs", "Title (Español)"],
      ["heroHeadlineEs", "Hero headline (Español)"],
      ["writtenGuidesHeadingEs", "Written Guides heading (Español)"],
      ["videoLibraryHeadingEs", "Video Library heading (Español)"],
      ["newsletterCopyEs", "Newsletter copy (Español)"],
      ["newsletterFinePrintEs", "Newsletter fine print (Español)"],
    ].map(([name, title]) =>
      defineField({ name, title, type: "string" }),
    ),
    defineField({
      name: "heroSubcopyEs",
      title: "Hero subcopy (Español)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "writtenGuidesSubcopyEs",
      title: "Written Guides subcopy (Español)",
      type: "text",
      rows: 3,
    }),
  ],
  __experimental_actions: ["update", "publish"],
});

export const aboutPage = stubPage("aboutPage", "About");
export const newsPage = stubPage("newsPage", "News");
export const contactPage = stubPage("contactPage", "Contact");
export const caseStudiesPage = stubPage("caseStudiesPage", "Case Studies");
export const memberPortalPage = stubPage("memberPortalPage", "Member Portal");
