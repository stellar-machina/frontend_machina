import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-8 text-center focus:outline-none"
    >
      <h1 className="text-3xl font-semibold tracking-tight">404</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        That page does not exist.
      </p>
      <Link
        href="/"
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-white dark:text-black"
      >
        Back to home
      </Link>

      <nav aria-label="Helpful links" className="mt-4">
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <Link
              href="/"
              className="text-blue-600 underline hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className="text-blue-600 underline hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href="/stats"
              className="text-blue-600 underline hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Stats
            </Link>
          </li>
          <li>
            <Link
              href="/docs"
              className="text-blue-600 underline hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Docs
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
