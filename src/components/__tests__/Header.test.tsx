import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../Header";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

import { usePathname } from "next/navigation";
const mockPathname = usePathname as jest.Mock;

function getMobileToggle() {
  return screen.getByRole("button", { name: /menu/i });
}

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

  it("mobile menu toggle has aria-expanded and aria-controls", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const toggle = getMobileToggle();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls");
  });

  it("mobile menu opens and closes on toggle", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const toggle = getMobileToggle();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: /mobile navigation/i })).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region", { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it("mobile menu closes on Escape and returns focus to toggle", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const toggle = getMobileToggle();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggle);
  });

  it("mobile menu auto-closes on route change", () => {
    mockPathname.mockReturnValue("/");
    const { rerender } = render(<Header />);

    const toggle = getMobileToggle();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    mockPathname.mockReturnValue("/services");
    rerender(<Header />);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region", { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it("preserves focus-visible ring classes on links", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.className).toContain("focus-visible:outline");
  });

  it("mobile menu manages focus when opening and closing", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const toggle = getMobileToggle();
    fireEvent.click(toggle);

    // Should focus the first menu item (Home)
    expect(screen.getByRole("menuitem", { name: "Home" })).toHaveFocus();

    // Close it
    fireEvent.click(toggle);
    expect(toggle).toHaveFocus();
  });

  it("closes the desktop More menu on blur when focus leaves the menu", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const moreBtn = screen.getByRole("button", { name: /more/i });
    fireEvent.click(moreBtn);

    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();

    // Blur from the menu to something else
    fireEvent.blur(menu, { relatedTarget: document.body });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the mobile menu when a secondary link is clicked", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    fireEvent.click(getMobileToggle());
    const webhooksLink = screen.getByRole("menuitem", { name: "Webhooks" });
    fireEvent.click(webhooksLink);

    expect(screen.queryByRole("region", { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it("closes the mobile menu when a primary link is clicked", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    fireEvent.click(getMobileToggle());
    const servicesLink = screen.getByRole("menuitem", { name: "Services" });
    fireEvent.click(servicesLink);

    expect(screen.queryByRole("region", { name: /mobile navigation/i })).not.toBeInTheDocument();
  });

  it("closes the desktop More menu when a link inside it is clicked", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const moreBtn = screen.getByRole("button", { name: /more/i });
    fireEvent.click(moreBtn);

    const apiKeysLink = screen.getByRole("menuitem", { name: "API Keys" });
    fireEvent.click(apiKeysLink);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("marks the active secondary route with aria-current in mobile menu", () => {
    mockPathname.mockReturnValue("/api-keys");
    render(<Header />);
    fireEvent.click(getMobileToggle());
    expect(screen.getByRole("menuitem", { name: "API Keys" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("keeps the desktop More menu open when focus moves within it", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));

    const menu = screen.getByRole("menu");
    const items = screen.getAllByRole("menuitem");
    const secondItem = items[1];

    fireEvent.blur(menu, { relatedTarget: secondItem });
    expect(menu).toBeInTheDocument();
  });

  it("isActive returns false for Home link when on another page", () => {
    mockPathname.mockReturnValue("/services");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("isActive returns false for similar but different routes", () => {
    mockPathname.mockReturnValue("/services-more");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Services" })).not.toHaveAttribute("aria-current");
  });

  it("isActive handles trailing slashes", () => {
    mockPathname.mockReturnValue("/services/");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "page");
  });

  it("marks a deep secondary route with aria-current", () => {
    mockPathname.mockReturnValue("/api-keys/new");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    expect(screen.getByRole("menuitem", { name: "API Keys" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("mobile menu does not close on other key presses", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const toggle = getMobileToggle();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(window, { key: "Enter" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("marks active routes in mobile menu", () => {
    mockPathname.mockReturnValue("/usage");
    render(<Header />);
    fireEvent.click(getMobileToggle());

    const usageLink = screen.getByRole("menuitem", { name: "Usage" });
    expect(usageLink).toHaveAttribute("aria-current", "page");
  });

  it("closes the desktop More menu on route change", () => {
    mockPathname.mockReturnValue("/");
    const { rerender } = render(<Header />);

    const moreBtn = screen.getByRole("button", { name: /more/i });
    fireEvent.click(moreBtn);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    mockPathname.mockReturnValue("/usage");
    rerender(<Header />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the desktop More menu when focused out to nothing", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /more/i }));

    const menu = screen.getByRole("menu");
    fireEvent.blur(menu, { relatedTarget: null });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("toggles the desktop More menu when clicked multiple times", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);

    const moreBtn = screen.getByRole("button", { name: /more/i });
    fireEvent.click(moreBtn);
    expect(moreBtn).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(moreBtn);
    expect(moreBtn).toHaveAttribute("aria-expanded", "false");
  });
});

