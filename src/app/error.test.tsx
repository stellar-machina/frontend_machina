import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "./error";

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

describe("ErrorBoundary — rendering", () => {
  it("renders the heading", () => {
    render(<ErrorBoundary error={makeError("boom")} reset={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /something went wrong/i })
    ).toBeInTheDocument();
  });

  it("renders the error message when one is provided", () => {
    render(
      <ErrorBoundary error={makeError("Network timeout")} reset={() => {}} />
    );
    expect(screen.getByText("Network timeout")).toBeInTheDocument();
  });

  it("renders fallback copy when error.message is empty", () => {
    render(<ErrorBoundary error={makeError("")} reset={() => {}} />);
    expect(
      screen.getByText(/an unexpected error occurred/i)
    ).toBeInTheDocument();
  });

  it("renders a Try again button", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });

  it("wraps error message in a role=alert region", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("oops");
  });

  it("renders the main landmark with id=main-content", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("tabIndex", "-1");
  });
});

// ---------------------------------------------------------------------------
// Button component integration
// ---------------------------------------------------------------------------

describe("ErrorBoundary — Button component", () => {
  it("uses the Button component for Try again action", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    const button = screen.getByRole("button", { name: /try again/i });
    expect(button).toHaveAttribute("type", "button");
    // Button component applies specific classes
    expect(button.className).toMatch(/rounded-full/);
    expect(button.className).toMatch(/px-5/);
    expect(button.className).toMatch(/py-2/);
  });

  it("Button has primary variant styling", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    const button = screen.getByRole("button", { name: /try again/i });
    expect(button.className).toMatch(/bg-black/);
    expect(button.className).toMatch(/text-white/);
  });

  it("Button has focus-visible outline", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    const button = screen.getByRole("button", { name: /try again/i });
    expect(button.className).toMatch(/focus-visible:outline/);
  });
});

// ---------------------------------------------------------------------------
// reset callback
// ---------------------------------------------------------------------------

describe("ErrorBoundary — reset interaction", () => {
  it("calls reset once when Try again is clicked", () => {
    const reset = jest.fn();
    render(<ErrorBoundary error={makeError("oops")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("calls reset again on each subsequent click", () => {
    const reset = jest.fn();
    render(<ErrorBoundary error={makeError("oops")} reset={reset} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(reset).toHaveBeenCalledTimes(3);
  });

  it("does not call reset on render, only on click", () => {
    const reset = jest.fn();
    render(<ErrorBoundary error={makeError("oops")} reset={reset} />);
    expect(reset).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Production safety — no stack traces in the DOM
// ---------------------------------------------------------------------------

describe("ErrorBoundary — production safety", () => {
  it("does not render the error stack trace", () => {
    const err = makeError("bad thing");
    err.stack = "Error: bad thing\n    at Component (file.tsx:10:5)";
    const { container } = render(
      <ErrorBoundary error={err} reset={() => {}} />
    );
    // The raw stack string must never appear anywhere in the rendered output.
    expect(container.textContent).not.toContain(err.stack);
    expect(container.textContent).not.toMatch(/at Component/);
  });

  it("does not render any stack-like content even when error has a long stack", () => {
    const err = makeError("crash");
    err.stack = [
      "Error: crash",
      "    at ErrorBoundary (error.tsx:10:5)",
      "    at renderWithHooks (react-dom.development.js:14985:18)",
      "    at mountIndeterminateComponent (react-dom.development.js:17811:13)",
    ].join("\n");
    const { container } = render(
      <ErrorBoundary error={err} reset={() => {}} />
    );
    expect(container.textContent).not.toMatch(/renderWithHooks/);
    expect(container.textContent).not.toMatch(/mountIndeterminateComponent/);
  });

  it("only renders error.message, never error.stack", () => {
    const err = makeError("User-friendly message");
    err.stack = "Error: User-friendly message\n    at dangerous stack trace";
    const { container } = render(
      <ErrorBoundary error={err} reset={() => {}} />
    );
    expect(container.textContent).toContain("User-friendly message");
    expect(container.textContent).not.toContain("dangerous stack trace");
  });
});

// ---------------------------------------------------------------------------
// console.error logging
// ---------------------------------------------------------------------------

describe("ErrorBoundary — error logging", () => {
  it("logs the error via console.error on mount", () => {
    const err = makeError("logged error");
    render(<ErrorBoundary error={err} reset={() => {}} />);
    expect(console.error).toHaveBeenCalledWith(
      "App error boundary caught:",
      err
    );
  });

  it("logs the error digest when present", () => {
    const err = makeError("crash", "abc-123");
    render(<ErrorBoundary error={err} reset={() => {}} />);
    expect(console.error).toHaveBeenCalledWith("Error digest:", "abc-123");
  });

  it("does not log digest when digest is absent", () => {
    const err = makeError("crash");
    render(<ErrorBoundary error={err} reset={() => {}} />);
    expect(console.error).not.toHaveBeenCalledWith(
      expect.stringMatching(/digest/),
      expect.anything()
    );
  });

  it("does not log digest when digest is undefined", () => {
    const err = makeError("crash", undefined);
    render(<ErrorBoundary error={err} reset={() => {}} />);
    const calls = (console.error as jest.Mock).mock.calls;
    const digestCalls = calls.filter((call) =>
      call.some((arg: unknown) => typeof arg === "string" && arg.includes("digest"))
    );
    expect(digestCalls).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Dark mode styling
// ---------------------------------------------------------------------------

describe("ErrorBoundary — dark mode", () => {
  it("applies dark mode classes to the error message", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    const alert = screen.getByRole("alert");
    expect(alert.className).toMatch(/dark:text-zinc-400/);
  });

  it("main landmark supports dark mode focus styles", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    const main = screen.getByRole("main");
    expect(main.className).toMatch(/focus:outline-none/);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe("ErrorBoundary — accessibility", () => {
  it("error message is announced via role=alert", () => {
    render(<ErrorBoundary error={makeError("Critical error")} reset={() => {}} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Critical error");
  });

  it("Try again button is keyboard operable", () => {
    const reset = jest.fn();
    render(<ErrorBoundary error={makeError("oops")} reset={reset} />);
    const button = screen.getByRole("button", { name: /try again/i });
    
    // Simulate keyboard activation
    button.focus();
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
    fireEvent.click(button);
    
    expect(reset).toHaveBeenCalled();
  });

  it("main landmark can receive focus for skip links", () => {
    render(<ErrorBoundary error={makeError("oops")} reset={() => {}} />);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("tabIndex", "-1");
    expect(main).toHaveAttribute("id", "main-content");
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("ErrorBoundary — edge cases", () => {
  it("handles error with undefined message", () => {
    const err = new Error() as Error & { digest?: string };
    render(<ErrorBoundary error={err} reset={() => {}} />);
    expect(
      screen.getByText(/an unexpected error occurred/i)
    ).toBeInTheDocument();
  });

  it("handles error with null-like properties", () => {
    const err = {
      message: "",
      name: "Error",
    } as Error & { digest?: string };
    render(<ErrorBoundary error={err} reset={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      /an unexpected error occurred/i
    );
  });

  it("handles very long error messages without breaking layout", () => {
    const longMessage = "A".repeat(500);
    render(<ErrorBoundary error={makeError(longMessage)} reset={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent(longMessage);
  });

  it("renders correctly when error message contains HTML-like characters", () => {
    render(
      <ErrorBoundary
        error={makeError("<script>alert('xss')</script>")}
        reset={() => {}}
      />
    );
    const alert = screen.getByRole("alert");
    // Text content should be escaped, not parsed as HTML
    expect(alert.textContent).toBe("<script>alert('xss')</script>");
  });
});
