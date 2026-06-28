import { PageShell } from "@/components/PageShell";
import { CurlBlock } from "@/components/CurlBlock";
import { resolveApiBase } from "@/lib/resolveApiBase";

export const metadata = { title: "Docs — AgentPay" };

export default function DocsPage() {
  const baseUrl = resolveApiBase();
  const sections = [
    {
      h: "POST /api/v1/usage",
      p: "Record incremental usage for an (agent, serviceId) pair. Body: { agent, serviceId, requests }.",
      curl: `curl -X POST ${baseUrl}/api/v1/usage \
  -H "Content-Type: application/json" \
  -d '{"agent":"agent-id","serviceId":"service-id","requests":1}'`,
    },
    {
      h: "GET /api/v1/usage/:agent/:serviceId",
      p: "Read the accumulated request total. Returns { agent, serviceId, total }.",
      curl: `curl ${baseUrl}/api/v1/usage/agent-id/service-id`,
    },
    {
      h: "POST /api/v1/settle",
      p: "Drain the accumulator and return { requests, priceStroops, billedStroops }.",
      curl: `curl -X POST ${baseUrl}/api/v1/settle \
  -H "Content-Type: application/json" \
  -d '{"agent":"agent-id"}'`,
    },
    {
      h: "POST /api/v1/services",
      p: "Register a service with priceStroops/request. Idempotent.",
      curl: `curl -X POST ${baseUrl}/api/v1/services \
  -H "Content-Type: application/json" \
  -d '{"name":"my-service","priceStroops":100}'`,
    },
    {
      h: "POST /api/v1/admin/{pause,unpause}",
      p: "Toggle the global pause flag; GET /admin/status to read.",
      curl: `curl -X POST ${baseUrl}/api/v1/admin/pause`,
    },
  ];

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
            <CurlBlock command={s.curl} />
          </div>
        ))}
      </dl>
    </PageShell>
  );
}
