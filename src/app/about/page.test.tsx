import { render, screen } from "@testing-library/react";
import AboutPage from "./page";

describe("AboutPage", () => {
  it("renders the intro copy and each dashboard surface link", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { name: /About AgentPay/i })).toBeInTheDocument();
    expect(
      screen.getByText(/AgentPay is a pay-per-request payment protocol for autonomous AI agents and APIs/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This dashboard exposes every read and write surface the backend provides:/i)
    ).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: /dashboard surfaces/i });
    expect(nav).toBeInTheDocument();

    const surfaces = [
      ["Service registry", "/services"],
      ["Usage metering", "/usage"],
      ["Billing quotes", "/docs"],
      ["Audit log", "/events"],
      ["Webhooks", "/webhooks"],
      ["API keys", "/api-keys"],
      ["Admin pause/unpause", "/admin"],
    ] as const;

    for (const [label, href] of surfaces) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", href);
    }

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(surfaces.length);
  });
});
