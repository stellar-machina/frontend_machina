import { render, screen } from "@testing-library/react";
import Loading from "./loading";

describe("Loading", () => {
  it("renders inside the main landmark for skip-link focus", () => {
    render(<Loading />);

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
  });

  it("exposes a polite status region announcing the loading state (WCAG 4.1.3)", () => {
    render(<Loading />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Loading…");
  });

  it("provides the loading label as visually hidden sr-only text", () => {
    render(<Loading />);

    const label = screen.getByText("Loading…");
    expect(label).toHaveClass("sr-only");
    // The status region owns the label so AT reads it as one announcement.
    expect(screen.getByRole("status")).toContainElement(label);
  });

  it("hides the visual skeleton blocks from assistive technology", () => {
    render(<Loading />);

    const status = screen.getByRole("status");
    const blocks = status.querySelectorAll("[aria-hidden='true']");
    expect(blocks).toHaveLength(3);
    blocks.forEach((block) => {
      expect(block).toHaveClass("animate-pulse");
    });
  });

  it("does not expose any skeleton block as its own status message", () => {
    render(<Loading />);

    // Exactly one status node exists; the pulsing blocks must not announce
    // themselves individually.
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });
});
