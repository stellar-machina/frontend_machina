import Link from "next/link";

export const metadata = { title: "About — AgentPay" };

const surfaces = [
  { label: "Service registry", href: "/services" },
  { label: "Usage metering", href: "/usage" },
  { label: "Billing quotes", href: "/docs" },
  { label: "Audit log", href: "/events" },
  { label: "Webhooks", href: "/webhooks" },
  { label: "API keys", href: "/api-keys" },
  { label: "Admin pause/unpause", href: "/admin" },
];

export default function AboutPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-2xl flex-col gap-4 p-8 focus:outline-none"
    >
      <h1 className="text-3xl font-semibold tracking-tight">About AgentPay</h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        AgentPay is a pay-per-request payment protocol for autonomous AI
        agents and APIs, settled on Stellar via Soroban. Agents accrue usage
        against registered services off-chain; a settlement worker drains
        the usage counters and mirrors them on-chain.
      </p>
      <p className="text-zinc-700 dark:text-zinc-300">
        This dashboard exposes every read and write surface the backend
        provides: service registry, usage metering, billing quotes, audit
        log, webhooks, API keys, and admin pause/unpause. Use the links below
        to jump directly to each surface.
      </p>
      <nav aria-label="Dashboard surfaces">
        <ul className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {surfaces.map((surface) => (
            <li key={surface.href}>
              <Link
                href={surface.href}
                className="block rounded-md px-3 py-2 text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-blue-300"
              >
                {surface.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
