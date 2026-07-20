import type { APIRoute } from "astro";
import { sanityClient } from "../lib/sanity";
import generated from "../i18n/tables/es.generated.json";
import overrides from "../i18n/tables/es.overrides.json";
import { validateTable } from "../i18n/contract";
import { localizedContent } from "../i18n/view";

const origin = "https://rebuild.us";

export const GET: APIRoute = async () => {
  const [siteSettings, splash, resourcesPage, privacyPage, guides, videos] = await Promise.all([
    sanityClient.fetch(`*[_type == "siteSettings"][0]`),
    sanityClient.fetch(`*[_type == "splashPage"][0]`),
    sanityClient.fetch(`*[_type == "resourcesPage"][0]`),
    sanityClient.fetch(`*[_type == "privacyPage"][0]`),
    sanityClient.fetch(`*[_type == "resourceGuide"]{ _id, title }`),
    sanityClient.fetch(`*[_type == "resourceVideo"]{ _id, title }`),
  ]);
  const localized = localizedContent({ siteSettings, splash, resourcesPage, privacyPage, guides, videos }, validateTable(generated), validateTable(overrides));
  const routes = ["/", "/resources", "/privacy"];
  const spanish = [
    localized.included.has("splash") && "/es/",
    localized.included.has("resourcesPage") && "/es/resources",
    localized.included.has("privacyPage") && "/es/privacy",
  ].filter(Boolean) as string[];
  const entries = routes
    .map((route) => {
      const es = route === "/" ? "/es/" : `/es${route}`;
      const renderable = spanish.includes(es);
      const alternates = renderable
        ? `<xhtml:link rel="alternate" hreflang="en" href="${origin}${route}"/><xhtml:link rel="alternate" hreflang="es" href="${origin}${es}"/>`
        : "";
      return `<url><loc>${origin}${route}</loc>${alternates}</url>${renderable ? `<url><loc>${origin}${es}</loc>${alternates}</url>` : ""}`;
    })
    .join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`, {
    headers: { "Content-Type": "application/xml" },
  });
};
