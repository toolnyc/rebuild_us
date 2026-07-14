import { defineType, defineField } from 'sanity';

const visibleField = defineField({
  name: 'visible',
  title: 'Visible',
  type: 'boolean',
  initialValue: false,
});

const highlightDecorator = {
  title: 'Highlight',
  value: 'highlight',
};

const richText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      {
        type: 'block',
        styles: [{ title: 'Normal', value: 'normal' }],
        lists: [],
        marks: {
          decorators: [
            { title: 'Strong', value: 'strong' },
            { title: 'Emphasis', value: 'em' },
            highlightDecorator,
          ],
          annotations: [
            {
              name: 'link',
              type: 'object',
              title: 'Link',
              fields: [{ name: 'href', type: 'url', title: 'URL' }],
            },
          ],
        },
      },
    ],
  });

export const splashPage = defineType({
  name: 'splashPage',
  title: 'Splash Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'about', title: 'About' },
    { name: 'founding', title: 'Founding CTA' },
    { name: 'whyJoin', title: 'Why Join' },
    { name: 'resources', title: 'Resources' },
    { name: 'getInvolved', title: 'Get Involved' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Splash' }),
    visibleField,

    // Hero
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt text', type: 'string' }],
    }),
    defineField({ name: 'heroHeadline', title: 'Hero headline (leading)', type: 'string', group: 'hero' }),
    defineField({
      name: 'heroHeadlineAccent',
      title: 'Hero headline accent (orange italic)',
      type: 'string',
      group: 'hero',
    }),
    defineField({ name: 'heroSubcopy', title: 'Hero subcopy', type: 'string', group: 'hero' }),
    defineField({ name: 'heroImageCaption', title: 'Hero image caption', type: 'string', group: 'hero' }),

    // About
    defineField({ name: 'aboutLabel', title: 'About eyebrow label', type: 'string', group: 'about' }),
    richText('aboutStatement', 'About statement'),
    defineField({ name: 'aboutSupport', title: 'About supporting paragraph', type: 'string', group: 'about' }),

    // Founding CTA
    defineField({ name: 'foundingLabel', title: 'Founding eyebrow label', type: 'string', group: 'founding' }),
    defineField({ name: 'foundingCtaHeadline', title: 'Founding CTA headline', type: 'string', group: 'founding' }),
    defineField({ name: 'foundingCtaSubcopy', title: 'Founding CTA subcopy', type: 'string', group: 'founding' }),

    // Why Join
    defineField({ name: 'benefitsLabel', title: 'Why Join eyebrow label', type: 'string', group: 'whyJoin' }),
    defineField({
      name: 'whyJoinColumns',
      title: 'Why Join columns',
      type: 'array',
      group: 'whyJoin',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'body', title: 'Body', type: 'text', rows: 4 },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [{ name: 'alt', title: 'Alt text', type: 'string' }],
            },
            {
              name: 'backgroundColor',
              title: 'Background color',
              type: 'string',
              options: {
                list: [
                  { title: 'Cream', value: '#F1E9DD' },
                  { title: 'Yellow', value: '#ECF278' },
                  { title: 'Sage', value: '#A7B795' },
                  { title: 'Orange', value: '#F4552A' },
                  { title: 'Ink', value: '#1F1B17' },
                ],
              },
              initialValue: '#F1E9DD',
            },
          ],
          preview: { select: { title: 'title', media: 'image' } },
        },
      ],
    }),

    // Resources
    defineField({ name: 'resourcesLabel', title: 'Resources eyebrow label', type: 'string', group: 'resources' }),
    defineField({ name: 'resourcesHeadline', title: 'Resources headline', type: 'string', group: 'resources' }),
    richText('resourcesSubcopy', 'Resources subcopy'),
    defineField({ name: 'resourcesLeftCopy', title: 'Resources intro copy', type: 'text', rows: 3, group: 'resources' }),
    defineField({
      name: 'resourceItems',
      title: 'Resource guides',
      type: 'array',
      group: 'resources',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'format', title: 'Format', type: 'string', initialValue: 'PDF' },
            { name: 'file', title: 'File', type: 'file' },
          ],
          preview: { select: { title: 'title', subtitle: 'format' } },
        },
      ],
    }),

    // Get Involved
    defineField({ name: 'getInvolvedCopy', title: 'Get Involved copy', type: 'string', group: 'getInvolved' }),
    defineField({
      name: 'getInvolvedFinePrint',
      title: 'Get Involved fine print',
      type: 'string',
      group: 'getInvolved',
    }),
  ],
  __experimental_actions: ['update', 'publish'],
});

export const privacyPage = defineType({
  name: 'privacyPage',
  title: 'Privacy',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Privacy Policy' }),
    visibleField,
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
  ],
  __experimental_actions: ['update', 'publish'],
});

const stubPage = (name: string, title: string) =>
  defineType({
    name,
    title,
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string', initialValue: title }),
      visibleField,
    ],
    __experimental_actions: ['update', 'publish'],
  });

export const aboutPage = stubPage('aboutPage', 'About');
export const newsPage = stubPage('newsPage', 'News');
export const resourcesPage = stubPage('resourcesPage', 'Resources');
export const contactPage = stubPage('contactPage', 'Contact');
export const caseStudiesPage = stubPage('caseStudiesPage', 'Case Studies');
export const memberPortalPage = stubPage('memberPortalPage', 'Member Portal');
