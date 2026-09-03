import { defineType, defineField } from 'sanity';

const esString = (name: string, title: string) =>
  defineField({ name, title, type: 'string', group: 'es' });

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [{ name: 'es', title: 'Español' }],
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
      name: 'fundraiseUpCampaignId',
      title: 'Fundraise Up campaign ID',
      type: 'string',
      initialValue: 'FUNKBGQPBRY',
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

    // Español — shared UI labels and announcement copy for the /es/ pages
    esString('announcementTextEs', 'Announcement text (Español)'),
    esString('announcementCtaLabelEs', 'Announcement CTA label (Español)'),
    esString('navResourcesEs', 'Nav "Resources" label (Español)'),
    esString('navJoinEs', 'Nav "Join" label (Español)'),
    esString('footerPrivacyEs', 'Footer "Privacy Policy" label (Español)'),
    esString('footerCopyrightEs', 'Footer copyright line (Español)'),
    esString('backHomeEs', '"Back home" label (Español)'),
    esString('videoPlayEs', '"Play video:" label (Español)'),
    esString('downloadLabelEs', '"Download" label (Español)'),
    esString('guidesEmptyEs', '"No guides yet." label (Español)'),
    esString('guidesDisasterTipsheetsEs', 'Guide section "Disaster Tipsheets" (Español)'),
    esString('guidesSurvivorsEs', 'Guide section "For Survivors & Our Communities" (Español)'),
    esString('guidesFemaEs', 'Guide section "FEMA & Government Programs" (Español)'),
    esString('guidesInsuranceEs', 'Guide section "Insurance" (Español)'),
    esString('statsFoundingEs', 'Stat label "Founding member spots" (Español)'),
    esString('statsNetworkEs', 'Stat label "Survivor-built network" (Español)'),
    esString('statsSurvivorsEs', 'Stat label "Disaster survivors" (Español)'),
    esString('statsNetworkValueEs', 'Stat value "Nationwide" (Español)'),
    esString('statsSurvivorsValueEs', 'Stat value "By & for" (Español)'),
    esString('followAlongEs', '"Follow along" social heading (Español)'),
  ],
  __experimental_actions: ['update', 'publish'],
});
