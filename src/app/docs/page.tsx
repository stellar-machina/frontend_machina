import { PageShell } from "@/components/PageShell";

export const metadata = { title: "Docs — AgentPay" };

const sections = [
  {
    h: "POST /api/v1/usage",
    p: "Record incremental usage for an (agent, serviceId) pair. Body: { agent, serviceId, requests }.",
  },
  {
    h: "GET /api/v1/usage/:agent/:serviceId",
    p: "Read the accumulated request total. Returns { agent, serviceId, total }.",
  },
  {
    h: "POST /api/v1/settle",
    p: "Drain the accumulator and return { requests, priceStroops, billedStroops }.",
  },
  {
    h: "POST /api/v1/services",
    p: "Register a service with priceStroops/request. Idempotent.",
  },
  {
    h: "POST /api/v1/admin/{pause,unpause}",
    p: "Toggle the global pause flag; GET /admin/status to read.",
  },
];

export default function DocsPage() {
  return (
    <PageShell maxWidth="3xl" gap="6">
      <h1 className="text-3xl font-semibold tracking-tight">API documentation</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Companion to{" "}
        <a className="underline" href="/api/v1/openapi.json">
          GET /api/v1/openapi.json
        </a>{" "}
        — short prose for the most common endpoints.
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        For the complete request/response contract of every endpoint the dashboard
        calls, see the{" "}
        <a
          className="underline"
          href="https://github.com/Agentpay-Org/Agentpay-frontend/blob/main/docs/api-integration.md"
        >
          dashboard API integration reference
        </a>
        .
      </p>
      <dl className="space-y-4">
        {sections.map((s) => (
          <div key={s.h}>
            <dt className="font-mono text-sm font-medium">{s.h}</dt>
            <dd className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{s.p}</dd>
          </div>
        ))}
      </dl>
    </PageShell>
  );
}
