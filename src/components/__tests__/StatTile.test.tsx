import { render, screen } from "@testing-library/react";
import { StatTile } from "../StatTile";

describe("StatTile", () => {
  const getTrend = (container: HTMLElement) => {
    const trend = container.querySelector("p");
    expect(trend).toBeInTheDocument();
    return trend as HTMLParagraphElement;
  };

  it("renders the label and value", () => {
    render(<StatTile label="Requests" value="1 234" />);
    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("1 234")).toBeInTheDocument();
  });

  it("does not render a trend element when trend prop is omitted", () => {
    const { container } = render(<StatTile label="Requests" value="1 234" />);
    expect(container.querySelector("p")).toBeNull();
  });

  // positiveIsGood defaults to true (undefined !== false)
  it("shows green intent when delta > 0 and positiveIsGood is true (default)", () => {
    const { container } = render(
      <StatTile label="Revenue" value="$100" trend={{ delta: 5 }} />,
    );
    const trend = getTrend(container);
    expect(trend).toHaveTextContent("+5");
    expect(trend.className).toMatch(/emerald/);
  });

  it("shows red intent when delta < 0 and positiveIsGood is true (default)", () => {
    const { container } = render(
      <StatTile label="Revenue" value="$100" trend={{ delta: -3 }} />,
    );
    const trend = getTrend(container);
    expect(trend).toHaveTextContent("-3");
    expect(trend.className).toMatch(/rose/);
  });

  // positiveIsGood = false: increasing is bad (e.g. error rate)
  it("shows red intent when delta > 0 and positiveIsGood is false", () => {
    const { container } = render(
      <StatTile
        label="Errors"
        value="42"
        trend={{ delta: 7, positiveIsGood: false }}
      />,
    );
    const trend = getTrend(container);
    expect(trend).toHaveTextContent("+7");
    expect(trend.className).toMatch(/rose/);
  });

  it("shows green intent when delta < 0 and positiveIsGood is false", () => {
    const { container } = render(
      <StatTile
        label="Errors"
        value="42"
        trend={{ delta: -2, positiveIsGood: false }}
      />,
    );
    const trend = getTrend(container);
    expect(trend).toHaveTextContent("-2");
    expect(trend.className).toMatch(/emerald/);
  });

  it("shows red intent when delta is zero and positiveIsGood is true (no growth = bad)", () => {
    // delta ≤ 0, positiveIsGood !== false (undefined) → positiveIsGood === false is false → rose
    const { container } = render(
      <StatTile label="Latency" value="99 ms" trend={{ delta: 0 }} />,
    );
    const trendEl = getTrend(container);
    expect(trendEl?.className).toMatch(/rose/);
  });

  it("shows green intent when delta is zero and positiveIsGood is false (no increase = ok)", () => {
    // delta ≤ 0, positiveIsGood === false → true → emerald
    const { container } = render(
      <StatTile
        label="Errors"
        value="42"
        trend={{ delta: 0, positiveIsGood: false }}
      />,
    );
    const trendEl = getTrend(container);
    expect(trendEl?.className).toMatch(/emerald/);
  });

  it("prefixes positive delta with a plus sign", () => {
    const { container } = render(
      <StatTile label="x" value="y" trend={{ delta: 10 }} />,
    );
    expect(getTrend(container)).toHaveTextContent("+10");
  });

  it("does not prefix negative delta with a plus sign", () => {
    const { container } = render(
      <StatTile label="x" value="y" trend={{ delta: -10 }} />,
    );
    expect(getTrend(container)).toHaveTextContent("-10");
  });
});
