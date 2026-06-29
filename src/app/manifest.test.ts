import manifest from "./manifest";

describe("manifest metadata route", () => {
  it("returns a valid manifest configuration", () => {
    const config = manifest();

    // Required fields assertion
    expect(config.name).toBe("AgentPay");
    expect(config.short_name).toBe("AgentPay");
    expect(config.description).toBe("Machine-to-machine payment protocol on Stellar");
    expect(config.start_url).toBe("/");
    expect(config.display).toBe("standalone");

    // Colors matching globals.css dark/light palette
    const allowedColors = ["#0a0a0a", "#ffffff"];
    expect(allowedColors).toContain(config.background_color);
    expect(allowedColors).toContain(config.theme_color);

    // Icon entries check
    expect(config.icons).toBeDefined();
    expect(config.icons!.length).toBeGreaterThan(0);
    const hasFavicon = config.icons!.some(
      (icon) => icon.src === "/favicon.ico"
    );
    expect(hasFavicon).toBe(true);
  });
});
