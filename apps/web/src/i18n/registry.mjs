// @ts-check

import { hashSource } from "./hash.mjs";

/** @typedef {import("./registry").ContentOwner} ContentOwner */
/** @typedef {import("./registry").TranslatableMessage} TranslatableMessage */
/** @typedef {import("./registry").TranslationSource} TranslationSource */

/**
 * @param {string} owner
 * @param {string} key
 * @param {unknown} value
 * @param {string[]} path
 * @returns {TranslatableMessage | undefined}
 */
const plain = (owner, key, value, path) =>
  typeof value === "string" ? { owner, key, kind: "plain", value, path } : undefined;

/**
 * @param {string} owner
 * @param {string} key
 * @param {unknown} value
 * @param {string[]} path
 * @returns {TranslatableMessage | undefined}
 */
const richText = (owner, key, value, path) =>
  Array.isArray(value) ? { owner, key, kind: "richText", value, path } : undefined;

/** @template T @param {(T | undefined)[]} values @returns {T[]} */
const compact = (values) => values.filter((value) => value !== undefined);

/** @param {TranslationSource} source @returns {ContentOwner[]} */
export function translationRegistry({
  siteSettings = {},
  splash = {},
  resourcesPage = {},
  privacyPage = {},
  guides = [],
  videos = [],
} = {}) {
  /** @type {ContentOwner} */
  const site = {
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
      plain("site", "site.stats.founding", "Founding member spots", ["statsFounding"]),
      plain("site", "site.stats.network", "Survivor-built network", ["statsNetwork"]),
      plain("site", "site.stats.survivors", "Disaster survivors", ["statsSurvivors"]),
      plain("site", "site.announcement.text", siteSettings.announcementText, ["announcementText"]),
      plain("site", "site.announcement.cta", siteSettings.announcementCtaLabel, ["announcementCtaLabel"]),
    ]),
  };

  /** @type {ContentOwner} */
  const splashOwner = {
    id: "splash",
    route: "/",
    messages: compact([
      ...[
        "heroHeadline",
        "heroHeadlineAccent",
        "heroSubcopy",
        "heroImageCaption",
        "aboutLabel",
        "aboutSupport",
        "foundingLabel",
        "foundingCtaHeadline",
        "foundingCtaSubcopy",
        "benefitsLabel",
        "resourcesLabel",
        "resourcesHeadline",
        "resourcesLeftCopy",
        "getInvolvedCopy",
        "getInvolvedFinePrint",
      ].map((field) => plain("splash", `splash.${field}`, splash[field], [field])),
      richText("splash", "splash.about.statement", splash.aboutStatement, ["aboutStatement"]),
      richText("splash", "splash.resources.subcopy", splash.resourcesSubcopy, ["resourcesSubcopy"]),
      ...(Array.isArray(splash.whyJoinColumns)
        ? splash.whyJoinColumns.flatMap((column, index) =>
            compact([
              plain("splash", `splash.whyJoin.${index}.title`, column.title, ["whyJoinColumns", String(index), "title"]),
              plain("splash", `splash.whyJoin.${index}.body`, column.body, ["whyJoinColumns", String(index), "body"]),
            ]),
          )
        : []),
    ]),
  };

  /** @type {ContentOwner} */
  const resourcesOwner = {
    id: "resourcesPage",
    route: "/resources",
    messages: compact(
      [
        "title",
        "heroHeadline",
        "heroSubcopy",
        "writtenGuidesHeading",
        "writtenGuidesSubcopy",
        "videoLibraryHeading",
        "newsletterCopy",
        "newsletterFinePrint",
      ].map((field) => plain("resourcesPage", `resources.${field}`, resourcesPage[field], [field])),
    ),
  };

  /** @type {ContentOwner} */
  const privacyOwner = {
    id: "privacyPage",
    route: "/privacy",
    messages: compact([
      plain("privacyPage", "privacy.title", privacyPage.title, ["title"]),
      richText("privacyPage", "privacy.body", privacyPage.body, ["body"]),
    ]),
  };

  /** @type {ContentOwner[]} */
  const resourceOwners = [
    ...guides.map((guide) => /** @type {ContentOwner} */ ({
      id: `guide.${guide._id}`,
      route: "/resources",
      messages: compact([plain(`guide.${guide._id}`, `guide.${guide._id}.title`, guide.title, ["title"])]),
    })),
    ...videos.map((video) => /** @type {ContentOwner} */ ({
      id: `video.${video._id}`,
      route: "/resources",
      messages: compact([plain(`video.${video._id}`, `video.${video._id}.title`, video.title, ["title"])]),
    })),
  ];

  return [site, splashOwner, resourcesOwner, privacyOwner, ...resourceOwners];
}

/**
 * @param {TranslationSource} source
 * @returns {(TranslatableMessage & { route: ContentOwner["route"]; sourceHash: string })[]}
 */
export function translationEntries(source) {
  return translationRegistry(source).flatMap((owner) =>
    owner.messages.map((message) => ({
      ...message,
      route: owner.route,
      sourceHash: hashSource(message.kind, message.value),
    })),
  );
}
