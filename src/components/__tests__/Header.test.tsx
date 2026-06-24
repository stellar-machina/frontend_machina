import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../Header";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

import { usePathname } from "next/navigation";
const mockPathname = usePathname as jest.Mock;

describe("Header", () => {
  it("renders a named navigation landmark", () => {
    render(<Header />);
    expect(
      screen.getByRole("navigation", { name: /main navigation/i })
    ).toBeInTheDocument();
  });

  it("renders all primary links", () => {
    render(<Header />);
    for (const label of ["Home", "Services", "Agents", "Usage", "Search"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the active primary route with aria-current", () => {
    mockPathname.mockReturnValue("/services");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("marks a deep child route on the parent primary link", () => {
    mockPathname.mockReturnValue("/services/abc/edit");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("shows More button that opens secondary menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    const moreBtn = screen.getByRole("button", { name: /more/i });
    expect(moreBtn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(moreBtn);
    expect(moreBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders all secondary links inside the menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    for (const label of ["API Keys", "Webhooks", "Events", "Stats", "Settings", "Docs", "Admin"]) {
      expect(screen.getByRole("menuitem", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the active secondary route with aria-current", () => {
    mockPathname.mockReturnValue("/api-keys");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    expect(screen.getByRole("menuitem", { name: "API Keys" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("closes the menu when a secondary link is clicked", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Webhooks" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the menu when focus leaves the secondary menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));

    fireEvent.blur(screen.getByRole("menu"), {
      relatedTarget: document.body,
    });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("preserves focus-visible ring classes on links", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.className).toContain("focus-visible:outline");
  });
});
