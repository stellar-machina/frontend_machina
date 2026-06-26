import { render, screen } from "@testing-library/react";
import React from "react";
import { PageShell } from "../PageShell";
import DocsPage from "@/app/docs/page";
import SettingsPage from "@/app/settings/page";

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe("PageShell Component", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it("renders a main landmark with default options", () => {
    render(<PageShell>Test Content</PageShell>);

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("tabIndex", "-1");
    expect(main.className).toContain("mx-auto");
    expect(main.className).toContain("min-h-[60vh]");
    expect(main.className).toContain("max-w-3xl");
    expect(main.className).toContain("gap-6");
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("handles custom maxWidth values", () => {
    const { rerender } = render(<PageShell maxWidth="xl">Content</PageShell>);
    expect(screen.getByRole("main").className).toContain("max-w-xl");

    rerender(<PageShell maxWidth="2xl">Content</PageShell>);
    expect(screen.getByRole("main").className).toContain("max-w-2xl");

    rerender(<PageShell maxWidth="7xl">Content</PageShell>);
    expect(screen.getByRole("main").className).toContain("max-w-7xl");

    rerender(<PageShell maxWidth="custom-500">Content</PageShell>);
    expect(screen.getByRole("main").className).toContain("max-w-custom-500");
  });

  it("handles custom gap values", () => {
    const { rerender } = render(<PageShell gap="8">Content</PageShell>);
    expect(screen.getByRole("main").className).toContain("gap-8");

    rerender(<PageShell gap="12">Content</PageShell>);
    expect(screen.getByRole("main").className).toContain("gap-12");

    rerender(<PageShell gap="16">Content</PageShell>);
    expect(screen.getByRole("main").className).toContain("gap-16");
  });

  it("merges custom className prop", () => {
    render(<PageShell className="custom-class-123">Content</PageShell>);
    const main = screen.getByRole("main");
    expect(main.className).toContain("custom-class-123");
    expect(main.className).toContain("max-w-3xl"); // preserves default
  });

  it("renders migrated DocsPage content inside PageShell", () => {
    render(<DocsPage />);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main.className).toContain("max-w-3xl");
    expect(screen.getByRole("heading", { name: /API documentation/i })).toBeInTheDocument();
  });

  it("renders migrated SettingsPage content inside PageShell", () => {
    render(<SettingsPage />);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main.className).toContain("max-w-2xl");
    expect(screen.getByRole("heading", { name: /Settings/i })).toBeInTheDocument();
  });
});
