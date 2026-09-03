import type { APIRoute } from "astro";

const origin = "https://rebuild.us";
const routes = ["/", "/resources", "/privacy"];

export const GET: APIRoute = async () => {
  const entries = routes
    .map((route) => {
      const es = route === "/" ? "/es/" : `/es${route}`;
      const alternates = `<xhtml:link rel="alternate" hreflang="en" href="${origin}${route}"/><xhtml:link rel="alternate" hreflang="es" href="${origin}${es}"/>`;
      return `<url><loc>${origin}${route}</loc>${alternates}</url><url><loc>${origin}${es}</loc>${alternates}</url>`;
    })
    .join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`, {
    headers: { "Content-Type": "application/xml" },
  });
};
