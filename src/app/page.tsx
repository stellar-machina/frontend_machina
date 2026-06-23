import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start focus:outline-none"
      >
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            AgentPay
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Machine-to-machine payment protocol on Stellar. Pay-per-request
            billing for AI agents and APIs.
          </p>
        </div>
        <nav aria-label="Quick links" className="text-base font-medium">
          <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <li>
              <Link
                href="/services"
                className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                Manage services
              </Link>
            </li>
            <li>
              <Link
                href="/stats"
                className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                View stats
              </Link>
            </li>
            <li>
              <Link
                href="/usage"
                className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                Record usage
              </Link>
            </li>
            <li>
              <Link
                href="/agents"
                className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                Agents
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                Docs
              </Link>
            </li>
            <li>
              <a
                className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
                href="https://stellar.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stellar
              </a>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
