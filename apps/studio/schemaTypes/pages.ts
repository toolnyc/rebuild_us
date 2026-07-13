import { defineType, defineField } from 'sanity';

const visibleField = defineField({
  name: 'visible',
  title: 'Visible',
  type: 'boolean',
  initialValue: false,
});

export const splashPage = defineType({
  name: 'splashPage',
  title: 'Splash Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Splash' }),
    visibleField,
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
