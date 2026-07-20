import type { MessageKind, PortableTextBlock } from "./contract";

export interface TranslatableMessage {
  key: string;
  kind: MessageKind;
  value: string | PortableTextBlock[];
  owner: string;
  path: string[];
}

export interface ContentOwner {
  id: string;
  route: "/" | "/resources" | "/privacy";
  messages: TranslatableMessage[];
}

type Content = Record<string, unknown>;

const plain = (owner: string, key: string, value: unknown, path: string[]): TranslatableMessage | undefined =>
  typeof value === "string" ? { owner, key, kind: "plain", value, path } : undefined;

const richText = (owner: string, key: string, value: unknown, path: string[]): TranslatableMessage | undefined =>
  Array.isArray(value) ? { owner, key, kind: "richText", value: value as PortableTextBlock[], path } : undefined;

const compact = <T>(values: (T | undefined)[]): T[] => values.filter((value): value is T => value !== undefined);

export function translationRegistry({
  siteSettings = {},
  splash = {},
  resourcesPage = {},
  privacyPage = {},
  guides = [],
  videos = [],
}: {
  siteSettings?: Content;
  splash?: Content;
  resourcesPage?: Content;
  privacyPage?: Content;
  guides?: Content[];
  videos?: Content[];
}): ContentOwner[] {
  // Exclusions: destinations, embed URLs, analytics, social URLs, campaign IDs, images, alt text and IDs.
  const site: ContentOwner = {
    id: "site",
    route: "/",
    messages: compact([
      plain("site", "site.nav.resources", "Resources", ["navResources"]),
      plain("site", "site.nav.join", "Join Rebuild", ["navJoin"]),
      plain("site", "site.footer.privacy", "Privacy Policy", ["footerPrivacy"]),
      plain("site", "site.footer.copyright", "© 2026 Rebuild — The National Disaster Survivors Association", ["footerCopyright"]),
      plain("site", "site.backHome", "← Back home", ["backHome"]),
      plain("site", "site.video.play", "Play video:", ["videoPlay"]),
      plain("site", "site.guides.empty", "No guides yet.", ["guidesEmpty"]),
      plain("site", "site.guides.disasterTipsheets", "Disaster Tipsheets", ["guidesDisasterTipsheets"]),
      plain("site", "site.guides.survivors", "For Survivors & Our Communities", ["guidesSurvivors"]),
      plain("site", "site.guides.fema", "FEMA & Government Programs", ["guidesFema"]),
      plain("site", "site.guides.insurance", "Insurance", ["guidesInsurance"]),
      plain("site", "site.announcement.text", siteSettings.announcementText, ["announcementText"]),
      plain("site", "site.announcement.cta", siteSettings.announcementCtaLabel, ["announcementCtaLabel"]),
    ]),
  };

  const splashOwner: ContentOwner = {
    id: "splash",
    route: "/",
    // Exclusions: heroImage, whyJoinBgImage, their alt text, featured resource URLs.
    messages: compact([
      ...["heroHeadline", "heroHeadlineAccent", "heroSubcopy", "heroImageCaption", "aboutLabel", "aboutSupport", "foundingLabel", "foundingCtaHeadline", "foundingCtaSubcopy", "benefitsLabel", "resourcesLabel", "resourcesLeftCopy", "getInvolvedCopy", "getInvolvedFinePrint"].map((field) =>
        plain("splash", `splash.${field}`, splash[field], [field]),
      ),
      richText("splash", "splash.about.statement", splash.aboutStatement, ["aboutStatement"]),
      richText("splash", "splash.resources.subcopy", splash.resourcesSubcopy, ["resourcesSubcopy"]),
      ...(Array.isArray(splash.whyJoinColumns)
        ? splash.whyJoinColumns.flatMap((column, index) => {
            const data = column as Content;
            return compact([
              plain("splash", `splash.whyJoin.${index}.title`, data.title, ["whyJoinColumns", String(index), "title"]),
              plain("splash", `splash.whyJoin.${index}.body`, data.body, ["whyJoinColumns", String(index), "body"]),
            ]);
          })
        : []),
    ]),
  };

  const resourcesOwner: ContentOwner = {
    id: "resourcesPage",
    route: "/resources",
    messages: compact(
      ["title", "heroHeadline", "heroSubcopy", "writtenGuidesHeading", "writtenGuidesSubcopy", "videoLibraryHeading", "newsletterCopy", "newsletterFinePrint"].map(
        (field) => plain("resourcesPage", `resources.${field}`, resourcesPage[field], [field]),
      ),
    ),
  };

  const privacyOwner: ContentOwner = {
    id: "privacyPage",
    route: "/privacy",
    messages: compact([
      plain("privacyPage", "privacy.title", privacyPage.title, ["title"]),
      richText("privacyPage", "privacy.body", privacyPage.body, ["body"]),
    ]),
  };

  const resourceOwners = [
    ...guides.map((guide) => ({
      id: `guide.${guide._id}`,
      route: "/resources" as const,
      // Exclusions: section, file URL, order and document ID.
      messages: compact([plain(`guide.${guide._id}`, `guide.${guide._id}.title`, guide.title, ["title"])]),
    })),
    ...videos.map((video) => ({
      id: `video.${video._id}`,
      route: "/resources" as const,
      // Exclusions: YouTube URL, order and document ID.
      messages: compact([plain(`video.${video._id}`, `video.${video._id}.title`, video.title, ["title"])]),
    })),
  ];

  return [site, splashOwner, resourcesOwner, privacyOwner, ...resourceOwners];
}
