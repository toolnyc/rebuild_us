import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'showAnnouncement',
      title: 'Show announcement bar',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'announcementText',
      title: 'Announcement text',
      type: 'string',
      initialValue: 'Founding membership is open — only 500 spots.',
    }),
    defineField({
      name: 'announcementCtaLabel',
      title: 'Announcement CTA label',
      type: 'string',
      initialValue: 'Join Today →',
    }),
    defineField({
      name: 'announcementDestination',
      title: 'Announcement destination (URL or hash)',
      type: 'string',
      initialValue: '#join',
    }),
    defineField({
      name: 'showGive',
      title: 'Show GIVE button',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'joinDestination',
      title: 'JOIN destination (URL or hash)',
      type: 'string',
      initialValue: '#join',
    }),
    defineField({
      name: 'resourcesDestination',
      title: 'RESOURCES destination (URL or hash)',
      type: 'string',
      initialValue: '#resources',
    }),
    defineField({
      name: 'foundingMemberFormSrc',
      title: 'Founding Member form embed URL',
      type: 'string',
      initialValue: 'https://act.rebuild.us/founding-member/embed',
    }),
    defineField({
      name: 'getInvolvedFormSrc',
      title: 'Get Involved form embed URL',
      type: 'string',
      initialValue: 'https://act.rebuild.us/web/embed',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Facebook URL',
      type: 'url',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
    }),
  ],
  __experimental_actions: ['update', 'publish'],
});
