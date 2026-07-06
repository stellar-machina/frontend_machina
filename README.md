# Stellar Machina — Web Dashboard

The operator console for **Stellar Machina**, a pay-per-request payment network
for autonomous agents and APIs settled on Stellar. This app is the human-facing
window into the protocol: it lets service owners register offerings, mint and
revoke API keys, watch usage accrue in real time, inspect settlement events, and
manage disputes — all backed by the Stellar Machina API and the on-chain escrow
contract.

It's a **Next.js (App Router)** application written in TypeScript, deliberately
kept dependency-light so the surface area stays auditable.

---

## What you can do from here

The dashboard is organized around the lifecycle of a metered service. Each route
below is a real page in `src/app`:

| Area | Routes | What it's for |
| --- | --- | --- |
| **Overview** | `/`, `/stats` | At-a-glance protocol activity and headline counters |
| **Services** | `/services`, `/services/new`, `/services/:id`, `/services/:id/edit`, `/services/:id/agents` | Register, price, and administer the APIs being metered |
| **Agents** | `/agents`, `/agents/:agent` | Inspect the autonomous callers and their consumption |
| **Access** | `/api-keys` | Issue, rotate, and revoke keys that authenticate requests |
| **Usage & settlement** | `/usage`, `/events`, `/export` | Follow unsettled counters, on-chain drains, and export records |
| **Operations** | `/admin`, `/settings`, `/webhooks` | Pause controls, configuration, and outbound notifications |
| **Discovery** | `/search`, `/docs`, `/changelog`, `/about` | Find entities and read the in-app reference |

---

## How it's built

The app leans on React Server Components for the page shells and a thin,
well-tested client layer for talking to the API:

- **Rendering** — Next.js App Router with route-level `loading.tsx`, `error.tsx`,
  and a top-level `global-error.tsx` crash boundary so a failing panel never
  takes down the whole console.
- **Data access** — every network call flows through one place. `resolveApiBase.ts`
  works out which backend to hit, `apiClient.ts` wraps `fetch` with typed
  error handling, and the `useApi.ts` hook binds results to the current route.
- **Local UI state** — small, purpose-built hooks (`useLocalState.ts`,
  `useDebounce.ts`) instead of a heavy state library.
- **Presentation** — copy lives in `messages.ts`, formatting helpers in
  `format.ts`, and theming in `theme.ts`, so text and styling are centralized
  rather than scattered through components.
- **Hardening** — `securityHeaders.ts` and input guards like `validateNumber.ts`
  keep the client defensive by default.

---

## Running it locally

**Requirements:** Node.js 18+ and npm.

```bash
npm install
npm run dev
```

The console starts on <http://localhost:3000>. It expects a reachable Stellar
Machina backend — point it at one via configuration (below).

### Configuration

The dashboard reads its backend location from public environment variables at
build time:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_AGENTPAY_API_BASE` | Base URL of the Stellar Machina backend API |
| `NEXT_PUBLIC_AGENTPAY_SITE_ORIGIN` | Public origin of this dashboard (used for links/metadata) |

> These keys still carry the original `AGENTPAY_` prefix. A rename to a
> `MACHINA_` prefix is planned but intentionally deferred, since it has to be
> coordinated with every deployment environment at once.

---

## Everyday commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server with hot reload |
| `npm run build` | Produce a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run the Jest suite |
| `npm run test:coverage` | Run tests with a coverage report |
| `npm run test:watch` | Re-run tests on change |

Tests live next to the code they cover (`src/**/__tests__`) with shared fakes in
`src/__mocks__`. Please add or update a test with any behavioral change.

---

## Layout

```
src/
├── app/          # App Router pages, layouts, and route boundaries
├── components/   # Reusable presentational and interactive pieces
├── lib/          # API client, hooks, formatting, theming, guards
├── __mocks__/    # Shared test doubles
└── __tests__/    # Cross-cutting tests
```

---

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a pull request. In
short: keep the dependency footprint small, route all API traffic through the
`lib/` client layer, centralize copy in `messages.ts`, and ship a test with your
change.

## License

Released under the [MIT License](./LICENSE).
