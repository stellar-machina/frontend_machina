"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/agents", label: "Agents" },
  { href: "/usage", label: "Usage" },
  { href: "/search", label: "Search" },
];

const secondaryLinks = [
  { href: "/api-keys", label: "API Keys" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/events", label: "Events" },
  { href: "/stats", label: "Stats" },
  { href: "/settings", label: "Settings" },
  { href: "/docs", label: "Docs" },
  { href: "/admin", label: "Admin" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

const linkClass =
  "rounded px-2 py-1 text-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-800";
const activeLinkClass = "font-semibold text-blue-600 dark:text-blue-400";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 p-4"
      >
        <Link
          href="/"
          className="text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          AgentPay
        </Link>

        {/* Primary links — always visible */}
        <ul className="flex flex-wrap gap-1 text-sm">
          {primaryLinks.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`${linkClass} ${active ? activeLinkClass : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}

          {/* More menu — secondary links */}
          <li className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className={`${linkClass} flex items-center gap-1`}
            >
              More
              <svg
                aria-hidden
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6 8L1 3h10z" />
              </svg>
            </button>
            {menuOpen && (
              <ul
                role="menu"
                className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-md border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setMenuOpen(false);
                  }
                }}
              >
                {secondaryLinks.map((l) => {
                  const active = isActive(pathname, l.href);
                  return (
                    <li key={l.href} role="none">
                      <Link
                        href={l.href}
                        role="menuitem"
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`block px-4 py-2 text-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-zinc-800 ${active ? activeLinkClass : ""}`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
