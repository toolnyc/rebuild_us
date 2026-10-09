import { sanityClient } from "./sanity";

export const SITE_ORIGIN = "https://www.rebuild.us";

export interface SharePage {
  slug: string;
  title: string;
  titleEs: string | null;
  fileUrl: string;
  fileUrlEs: string | null;
}

export async function fetchSharePages(): Promise<SharePage[]> {
  return sanityClient.fetch(
    `*[_type == "sharePage" && defined(slug.current) && defined(file.asset)]{
      "slug": slug.current,
      title,
      titleEs,
      "fileUrl": file.asset->url,
      "fileUrlEs": fileEs.asset->url
    }`,
  );
}

export const sharePageUrl = (slug: string) => `${SITE_ORIGIN}/share/${slug}`;
export const sharePageUrlEs = (slug: string) =>
  `${SITE_ORIGIN}/es/share/${slug}`;

// The /es page is always built (it falls back to English), but hreflang must be
// reciprocal, so both pages only emit alternates when a translation exists.
export const hasSpanish = (page: SharePage) =>
  Boolean(page.titleEs || page.fileUrlEs);
