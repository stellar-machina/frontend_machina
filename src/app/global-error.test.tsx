import { render, screen, fireEvent } from "@testing-library/react";
import fs from "fs";
import path from "path";
import GlobalError from "./global-error";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeError(
  message: string,
  digest?: string
): Error & { digest?: string } {
  const err = new Error(message) as Error & { digest?: string };
  if (digest !== undefined) err.digest = digest;
  return err;
}

// Silence console.error noise produced by the useEffect log inside the
// component so Jest output stays clean.
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("GlobalError — rendering", () => {
  it("renders the heading", () => {
    render(<GlobalError error={makeError("boom")} reset={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /something went wrong/i })
    ).toBeInTheDocument();
  });

  it("renders the error message when one is provided", () => {
    render(
      <GlobalError error={makeError("Network timeout")} reset={() => {}} />
    );
    expect(screen.getByText("Network timeout")).toBeInTheDocument();
  });

  it("renders fallback copy when error.message is empty", () => {
    render(<GlobalError error={makeError("")} reset={() => {}} />);
    expect(
      screen.getByText(/an unexpected error occurred/i)
    ).toBeInTheDocument();
  });

  it("renders a Try again button", () => {
    render(<GlobalError error={makeError("oops")} reset={() => {}} />);
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("wraps content in an alert region with aria-live=assertive", () => {
    render(<GlobalError error={makeError("oops")} reset={() => {}} />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("gives the alert region id=main-content for skip-link compatibility", () => {
    render(<GlobalError error={makeError("oops")} reset={() => {}} />);
    expect(screen.getByRole("alert")).toHaveAttribute("id", "main-content");
  });
});

// ---------------------------------------------------------------------------
// digest (support correlation ID)
// ---------------------------------------------------------------------------

describe("GlobalError — error.digest", () => {
  it("renders the digest when present", () => {
    render(
      <GlobalError
        error={makeError("crash", "abc-123")}
        reset={() => {}}
      />
    );
    expect(screen.getByTestId("error-digest")).toBeInTheDocument();
    expect(screen.getByTestId("error-digest")).toHaveTextContent("abc-123");
  });

  it("does not render the digest section when digest is absent", () => {
    render(<GlobalError error={makeError("crash")} reset={() => {}} />);
    expect(screen.queryByTestId("error-digest")).not.toBeInTheDocument();
  });

  it("does not render the digest section when digest is undefined explicitly", () => {
    render(
      <GlobalError
        error={makeError("crash", undefined)}
        reset={() => {}}
      />
    );
    expect(screen.queryByTestId("error-digest")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// reset callback
// ---------------------------------------------------------------------------

describe("GlobalError — reset interaction", () => {
  it("calls reset once when Try again is clicked", () => {
    const reset = jest.fn();
    render(<GlobalError error={makeError("oops")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("calls reset again on each subsequent click", () => {
    const reset = jest.fn();
    render(<GlobalError error={makeError("oops")} reset={reset} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(reset).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// Production safety — no stack traces in the DOM
// ---------------------------------------------------------------------------

describe("GlobalError — production safety", () => {
  it("does not render the error stack trace", () => {
    const err = makeError("bad thing");
    err.stack = "Error: bad thing\n    at Component (file.tsx:10:5)";
    const { container } = render(
      <GlobalError error={err} reset={() => {}} />
    );
    // The raw stack string must never appear anywhere in the rendered output.
    expect(container.textContent).not.toContain(err.stack);
    expect(container.textContent).not.toMatch(/at Component/);
  });

  it("does not render any stack-like content even when error has a long stack", () => {
    const err = makeError("crash");
    err.stack = [
      "Error: crash",
      "    at GlobalError (global-error.tsx:10:5)",
      "    at renderWithHooks (react-dom.development.js:14985:18)",
      "    at mountIndeterminateComponent (react-dom.development.js:17811:13)",
    ].join("\n");
    const { container } = render(
      <GlobalError error={err} reset={() => {}} />
    );
    expect(container.textContent).not.toMatch(/renderWithHooks/);
    expect(container.textContent).not.toMatch(/mountIndeterminateComponent/);
  });
});

// ---------------------------------------------------------------------------
// Standalone rendering — no dependency on layout chrome
// ---------------------------------------------------------------------------

describe("GlobalError — standalone shell", () => {
  // jsdom strips <html> and <body> when rendering via React Testing Library
  // (those tags are hoisted into the document root and are therefore not
  // inside the container <div>). We verify the component *declares* them by
  // inspecting its source file — the Next.js contract requires both tags.
  const source = fs.readFileSync(
    path.resolve(__dirname, "global-error.tsx"),
    "utf8"
  );

  it("declares its own <html> element in source (Next.js contract)", () => {
    expect(source).toMatch(/<html/);
  });

  it("declares its own <body> element in source (Next.js contract)", () => {
    expect(source).toMatch(/<body/);
  });

  it("does not depend on Header, Footer, or ToastProvider being present", () => {
    // If those components were imported and crashed, this render would throw.
    // A clean render with no Header/Footer is sufficient proof.
    expect(() =>
      render(<GlobalError error={makeError("layout crash")} reset={() => {}} />)
    ).not.toThrow();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Button focus / blur — outline ring
// ---------------------------------------------------------------------------

describe("GlobalError — button focus ring", () => {
  it("applies a blue outline when the button receives focus", () => {
    render(<GlobalError error={makeError("oops")} reset={() => {}} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    fireEvent.focus(btn);
    expect(btn.style.outline).toBe("2px solid #3b82f6");
    expect(btn.style.outlineOffset).toBe("2px");
  });

  it("removes the outline when the button loses focus", () => {
    render(<GlobalError error={makeError("oops")} reset={() => {}} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    fireEvent.focus(btn);
    fireEvent.blur(btn);
    expect(btn.style.outline).toBe("none");
  });
});

// ---------------------------------------------------------------------------
// console.error logging
// ---------------------------------------------------------------------------

describe("GlobalError — error logging", () => {
  it("logs the error via console.error on mount", () => {
    const err = makeError("logged error");
    render(<GlobalError error={err} reset={() => {}} />);
    expect(console.error).toHaveBeenCalledWith(
      "Global error boundary caught:",
      err
    );
  });
});
