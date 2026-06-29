"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the browser console for developer visibility; a real app would
    // forward this to an observability service (e.g. Sentry) here.
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
          background: "#ffffff",
          color: "#171717",
        }}
      >
        <main
          id="main-content"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            textAlign: "center",
            gap: "1rem",
            maxWidth: "36rem",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Something went wrong.
          </h1>

          <p
            style={{
              fontSize: "0.875rem",
              color: "#52525b",
              margin: 0,
            }}
          >
            {error.message || "An unexpected error occurred."}
          </p>

          {error.digest && (
            <p
              data-testid="error-digest"
              style={{
                fontSize: "0.75rem",
                color: "#71717a",
                margin: 0,
              }}
            >
              Reference ID:{" "}
              <code style={{ fontFamily: "monospace" }}>{error.digest}</code>
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              borderRadius: "9999px",
              background: "#000000",
              color: "#ffffff",
              border: "none",
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline =
                "2px solid #3b82f6";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
