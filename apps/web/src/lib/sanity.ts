import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const isDev = import.meta.env.DEV;
const token = import.meta.env.SANITY_API_TOKEN;

export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  // Static build: always read fresh published content so a publish-triggered
  // rebuild never races the ~60s apicdn cache and bakes stale data (e.g. a
  // just-published hero image) into the generated HTML.
  useCdn: false,
  // In dev, read draft edits from Studio without publishing.
  ...(isDev && token ? { token, perspective: 'previewDrafts' as const } : {}),
});

const builder = createImageUrlBuilder(sanityClient);

export const urlFor = (source: SanityImageSource) => builder.image(source);
