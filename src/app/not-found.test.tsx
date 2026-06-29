import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders the 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
  });

  it("renders the explanatory text", () => {
    render(<NotFound />);
    expect(screen.getByText("That page does not exist.")).toBeInTheDocument();
  });

  it("renders the main landmark", () => {
    render(<NotFound />);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("tabIndex", "-1");
  });

  it("renders the primary Back to home button", () => {
    render(<NotFound />);
    const backButton = screen.getByRole("link", { name: "Back to home" });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute("href", "/");
  });

  it("renders the helpful links navigation landmark", () => {
    render(<NotFound />);
    const nav = screen.getByRole("navigation", { name: "Helpful links" });
    expect(nav).toBeInTheDocument();
  });

  it("renders a semantic list inside the navigation", () => {
    render(<NotFound />);
    const nav = screen.getByRole("navigation", { name: "Helpful links" });
    const list = screen.getByRole("list");
    expect(nav).toContainElement(list);
  });

  it("renders all four recovery links with correct labels and hrefs", () => {
    render(<NotFound />);

    const recoveryLinks = [
      { name: "Home", href: "/" },
      { name: "Services", href: "/services" },
      { name: "Stats", href: "/stats" },
      { name: "Docs", href: "/docs" },
    ] as const;

    const nav = screen.getByRole("navigation", { name: "Helpful links" });

    for (const { name, href } of recoveryLinks) {
      const link = screen.getByRole("link", { name });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", href);
      expect(nav).toContainElement(link);
    }
  });

  it("renders exactly four list items in the navigation", () => {
    render(<NotFound />);
    const nav = screen.getByRole("navigation", { name: "Helpful links" });
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(4);
    listItems.forEach((item) => {
      expect(nav).toContainElement(item);
    });
  });

  it("does not render any links to routes that do not exist", () => {
    render(<NotFound />);
    // Ensure we're only linking to routes that actually exist
    const allLinks = screen.getAllByRole("link");
    const hrefs = allLinks.map((link) => link.getAttribute("href"));
    
    // These are valid routes
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/services");
    expect(hrefs).toContain("/stats");
    expect(hrefs).toContain("/docs");
    
    // Ensure we don't link to non-existent routes
    expect(hrefs).not.toContain("/nonexistent");
    expect(hrefs).not.toContain("/fake-route");
  });

  it("makes the primary button keyboard-accessible with focus-visible outline", () => {
    render(<NotFound />);
    const backButton = screen.getByRole("link", { name: "Back to home" });
    expect(backButton).toHaveClass("focus-visible:outline");
  });

  it("makes all recovery links keyboard-accessible with focus-visible outline", () => {
    render(<NotFound />);
    const nav = screen.getByRole("navigation", { name: "Helpful links" });
    const links = screen.getAllByRole("link").filter((link) => nav.contains(link));
    
    links.forEach((link) => {
      expect(link).toHaveClass("focus-visible:outline");
    });
  });

  it("applies dark mode classes to the primary button", () => {
    render(<NotFound />);
    const backButton = screen.getByRole("link", { name: "Back to home" });
    expect(backButton).toHaveClass("dark:bg-white");
    expect(backButton).toHaveClass("dark:text-black");
  });

  it("applies dark mode classes to recovery links", () => {
    render(<NotFound />);
    const nav = screen.getByRole("navigation", { name: "Helpful links" });
    const links = screen.getAllByRole("link").filter((link) => nav.contains(link));
    
    links.forEach((link) => {
      expect(link).toHaveClass("dark:text-blue-400");
      expect(link).toHaveClass("dark:hover:text-blue-300");
    });
  });

  it("renders exactly five total links (one primary + four recovery)", () => {
    render(<NotFound />);
    const allLinks = screen.getAllByRole("link");
    expect(allLinks).toHaveLength(5);
  });
});
