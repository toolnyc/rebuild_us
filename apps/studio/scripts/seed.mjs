import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
// Token lives in apps/web/.env; project/dataset in apps/studio/.env.
config({ path: resolve(here, '../.env') });
config({ path: resolve(here, '../../web/.env') });

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('Missing SANITY project id or SANITY_API_TOKEN (write token) in env.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false });

const key = (n) => ({ _key: `k${n}` });

const block = (text, marks = []) => ({
  _type: 'block',
  _key: `b${Math.random().toString(36).slice(2, 8)}`,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: 's0', text, marks }],
});

// A block with a highlighted phrase in the middle.
const highlightedBlock = (before, highlighted, after) => ({
  _type: 'block',
  _key: `b${Math.random().toString(36).slice(2, 8)}`,
  style: 'normal',
  markDefs: [],
  children: [
    { _type: 'span', _key: 's0', text: before, marks: [] },
    { _type: 'span', _key: 's1', text: highlighted, marks: ['highlight'] },
    { _type: 'span', _key: 's2', text: after, marks: [] },
  ],
});

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  showAnnouncement: true,
  announcementText: 'Founding membership is open — only 500 spots.',
  announcementCtaLabel: 'Join Today →',
  announcementDestination: '#join',
  showGive: false,
  joinDestination: '#join',
  resourcesDestination: '#resources',
  foundingMemberFormSrc: 'https://act.rebuild.us/founding-member/embed',
  getInvolvedFormSrc: 'https://act.rebuild.us/join-form/embed',
};

const splashPage = {
  _id: 'splashPage',
  _type: 'splashPage',
  title: 'Splash',
  visible: true,
  heroHeadline: 'When things fall apart, we come',
  heroHeadlineAccent: 'together.',
  heroSubcopy:
    'Rebuild is a national membership association built by and for survivors of hurricanes, floods, wildfires, tornadoes, and more.',
  heroImageCaption: 'Community, in action',
  aboutLabel: 'Why we exist',
  aboutStatement: [
    highlightedBlock(
      'We come together to share wisdom, advocate for our interests, and build a national network with the ',
      'strength in numbers',
      ' to eventually make full recovery for every survivor a reality.'
    ),
  ],
  aboutSupport:
    "We know what it takes to get back on your feet, and we're here to help. Rebuild exists so that no survivor has to go through this alone.",
  foundingLabel: 'Founding membership',
  foundingCtaHeadline: 'Join today to become one of the 500 Founding Members of Rebuild.',
  foundingCtaSubcopy:
    'Get first-look access to advice, training, news, and community benefits coming online later this year.',
  benefitsLabel: 'Membership benefits',
  whyJoinColumns: [
    {
      ...key(0),
      _type: 'object',
      title: 'Build Community',
      body: "A growing network of survivors, leaders, and subject matter experts nationwide, so wherever disaster hits next, you're connected to people who've been there.",
      backgroundColor: '#F1E9DD',
    },
    {
      ...key(1),
      _type: 'object',
      title: 'Get Advice',
      body: 'A growing library of tools and resources to help you take on insurance claims, FEMA denials, and everything between, built by and for survivors. We also share hard to find news like detailed weather forecasts and updates on changes at FEMA.',
      backgroundColor: '#ECF278',
    },
    {
      ...key(2),
      _type: 'object',
      title: 'Free Trainings',
      body: 'Skills that put power back in your hands. Workshops on preparedness, response, leadership, and advocacy, led by survivors and experts who stick around after the cameras leave.',
      backgroundColor: '#A7B795',
    },
  ],
  resourcesLabel: 'Resources',
  resourcesHeadline: 'Resources',
  resourcesSubcopy: [
    highlightedBlock(
      'We know from direct experience just how ',
      'broken the recovery system',
      ' is — and how hard it is on survivors.'
    ),
  ],
  resourcesLeftCopy:
    'Our resource guides are a starting point to help make the process easier. For more survivor resources, visit rebuild.us/resources.',
  resourceItems: [
    { ...key(0), _type: 'object', title: 'Applying for FEMA Assistance', format: 'PDF' },
    { ...key(1), _type: 'object', title: "The Survivor's Guide to Mental Health", format: 'PDF' },
    { ...key(2), _type: 'object', title: 'Advocating for Yourself in an Insurance Dispute', format: 'PDF' },
  ],
  getInvolvedCopy: 'Not ready to become a founding member but want to stay in the loop?',
  getInvolvedFinePrint: 'No spam — just resources and updates from the network.',
};

const stub = (id, title, visible = false) => ({ _id: id, _type: id, title, visible });

const docs = [
  siteSettings,
  splashPage,
  { ...stub('privacyPage', 'Privacy Policy', true), body: [block('Privacy policy coming soon.')] },
  stub('resourcesPage', 'Resources'),
  stub('aboutPage', 'About'),
  stub('newsPage', 'News'),
  stub('contactPage', 'Contact'),
  stub('caseStudiesPage', 'Case Studies'),
  stub('memberPortalPage', 'Member Portal'),
];

const run = async () => {
  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();
  console.log(`Seeded ${docs.length} documents into ${projectId}/${dataset}.`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
