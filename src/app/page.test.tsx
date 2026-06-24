import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders AgentPay heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /AgentPay/i })).toBeInTheDocument();
  });

  it("renders protocol description", () => {
    render(<Home />);
    expect(screen.getByText(/Machine-to-machine payment protocol on Stellar/i)).toBeInTheDocument();
  });

  it("renders a labelled navigation landmark for quick links", () => {
    render(<Home />);
    const nav = screen.getByRole("navigation", { name: /Quick links/i });
    expect(nav).toBeInTheDocument();
  });

  it("renders quick-links inside a list", () => {
    render(<Home />);
    const nav = screen.getByRole("navigation", { name: /Quick links/i });
    const list = nav.querySelector("ul");
    expect(list).toBeInTheDocument();
    const items = list!.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it("includes Agents and Docs as primary destinations", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: /Agents/i })).toHaveAttribute("href", "/agents");
    expect(screen.getByRole("link", { name: /Docs/i })).toHaveAttribute("href", "/docs");
  });

  it("renders Stellar external link with target and rel attributes", () => {
    render(<Home />);
    const stellarLink = screen.getByRole("link", { name: /Stellar/i });
    expect(stellarLink).toHaveAttribute("href", "https://stellar.org");
    expect(stellarLink).toHaveAttribute("target", "_blank");
    expect(stellarLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
