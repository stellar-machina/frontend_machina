import { ThemeToggle } from "@/components/ThemeToggle";
import { PageShell } from "@/components/PageShell";
import { messages } from "@/lib/messages";

export const metadata = { title: "Settings — AgentPay" };

export default function SettingsPage() {
  return (
    <PageShell maxWidth="2xl" gap="8">
      <h1 className="text-3xl font-semibold tracking-tight">{messages.settings.heading}</h1>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">{messages.settings.appearance.heading}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {messages.settings.appearance.description}
        </p>
        <ThemeToggle />
      </section>
    </PageShell>
  );
}
