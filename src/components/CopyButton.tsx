"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore — clipboard may be unavailable in non-https contexts */
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className="rounded border border-zinc-300 px-2 py-0.5 text-xs hover:border-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-700"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
