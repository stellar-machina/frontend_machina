import { render, screen } from "@testing-library/react";
import { StatusDot } from "../StatusDot";

describe("StatusDot", () => {
  it("renders 'Operational' label for ok variant", () => {
    render(<StatusDot variant="ok" />);
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });

  it("renders 'Degraded' label for warn variant", () => {
    render(<StatusDot variant="warn" />);
    expect(screen.getByText("Degraded")).toBeInTheDocument();
  });

  it("renders 'Down' label for down variant", () => {
    render(<StatusDot variant="down" />);
    expect(screen.getByText("Down")).toBeInTheDocument();
  });

  it("colour dot is aria-hidden so the label carries the meaning", () => {
    const { container } = render(<StatusDot variant="ok" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).toBeInTheDocument();
  });

  it("ok dot has emerald colour class", () => {
    const { container } = render(<StatusDot variant="ok" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot?.className).toMatch(/emerald/);
  });

  it("warn dot has amber colour class", () => {
    const { container } = render(<StatusDot variant="warn" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot?.className).toMatch(/amber/);
  });

  it("down dot has rose colour class", () => {
    const { container } = render(<StatusDot variant="down" />);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot?.className).toMatch(/rose/);
  });

  it("visible label is not aria-hidden", () => {
    render(<StatusDot variant="ok" />);
    const label = screen.getByText("Operational");
    expect(label).not.toHaveAttribute("aria-hidden");
  });
});
