import { metadata, viewport } from "./layout";

describe("root layout metadata", () => {
  it("keeps the home route on the default Stellar Machina title", () => {
    expect(metadata.title).toMatchObject({
      default: "Stellar Machina",
      template: "%s — Stellar Machina",
    });
  });

  it("configures the manifest and apple-touch icon in metadata", () => {
    expect(metadata.manifest).toBe("/manifest.webmanifest");
    expect(metadata.icons).toMatchObject({
      apple: "/favicon.ico",
    });
  });

  it("configures the themeColor in viewport", () => {
    expect(viewport.themeColor).toEqual([
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ]);
  });
});
