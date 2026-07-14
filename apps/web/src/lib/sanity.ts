import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const isDev = import.meta.env.DEV;
const token = import.meta.env.SANITY_API_TOKEN;

export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: !isDev,
  // In dev, read draft edits from Studio without publishing.
  ...(isDev && token ? { token, perspective: 'previewDrafts' as const } : {}),
});

const builder = createImageUrlBuilder(sanityClient);

export const urlFor = (source: SanityImageSource) => builder.image(source);
