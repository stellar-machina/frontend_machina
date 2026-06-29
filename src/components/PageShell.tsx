import React from "react";

export interface PageShellProps {
  children: React.ReactNode;
  /**
   * Tailwind max-width suffix (e.g. 'xl', '2xl', '3xl', '4xl').
   * Defaults to '3xl'.
   */
  maxWidth?: "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | string;
  /**
   * Tailwind gap suffix (e.g. '6', '8').
   * Defaults to '6'.
   */
  gap?: "4" | "6" | "8" | "12" | string;
  /**
   * Additional className to append/merge.
   */
  className?: string;
}

/**
 * PageShell component consolidates the repeated main wrapper layout
 * used across pages to ensure consistent accessibility (skip link target,
 * focus styling, page spacing) and design language.
 */
export function PageShell({
  children,
  maxWidth = "3xl",
  gap = "6",
  className = "",
}: PageShellProps) {
  // Map standard maxWidth keys to class names safely to prevent dynamic class interpolation issues
  const maxWidthClass = {
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  }[maxWidth] || `max-w-${maxWidth}`;

  // Map gap keys to class names safely
  const gapClass = {
    "4": "gap-4",
    "6": "gap-6",
    "8": "gap-8",
    "12": "gap-12",
  }[gap] || `gap-${gap}`;

  const baseClasses = `mx-auto flex min-h-[60vh] ${maxWidthClass} flex-col ${gapClass} p-8 focus:outline-none`;
  const mergedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <main id="main-content" tabIndex={-1} className={mergedClasses}>
      {children}
    </main>
  );
}
