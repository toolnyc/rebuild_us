import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "rebuild",
  title: "Rebuild",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
            S.divider(),
            S.listItem()
              .title("Pages")
              .child(
                S.list()
                  .title("Pages")
                  .items([
                    S.documentTypeListItem("splashPage").title("Splash Page"),
                    S.documentTypeListItem("privacyPage").title("Privacy"),
                    S.documentTypeListItem("aboutPage").title("About"),
                    S.documentTypeListItem("newsPage").title("News"),
                    S.documentTypeListItem("resourcesPage").title("Resources"),
                    S.documentTypeListItem("contactPage").title("Contact"),
                    S.documentTypeListItem("caseStudiesPage").title(
                      "Case Studies",
                    ),
                    S.documentTypeListItem("memberPortalPage").title(
                      "Member Portal",
                    ),
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title("Resources")
              .child(
                S.list()
                  .title("Resources")
                  .items([
                    S.documentTypeListItem("resourceGuide").title(
                      "Resource Guides",
                    ),
                    S.documentTypeListItem("resourceVideo").title(
                      "Resource Videos",
                    ),
                  ]),
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
