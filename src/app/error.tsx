"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
    if (error.digest) {
      console.error("Error digest:", error.digest);
    }
  }, [error]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-8 text-center focus:outline-none"
    >
      <h1 className="text-2xl font-semibold">Something went wrong.</h1>
      <div role="alert" className="text-sm text-zinc-600 dark:text-zinc-400">
        {error.message || "An unexpected error occurred."}
      </div>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
