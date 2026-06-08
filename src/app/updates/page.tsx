import { AppShell } from "@/components/app-shell";
import { PageIntro } from "@/components/ui";
import { getUpdatesFeed } from "@/lib/pulse90-data";

export default async function UpdatesPage() {
  const { updates } = await getUpdatesFeed();

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro
          kicker="What changed"
          title="The tournament digest that keeps people oriented."
          detail="This feed is the daily retention loop: enough context to catch up without scrolling through headlines."
        />
        <div className="mt-6 space-y-4">
          {updates.map((update) => (
            <article className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5" key={update.title}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cobalt">
                {update.label}
              </p>
              <h2 className="mt-3 text-2xl font-black text-[#10131a]">
                {update.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#10131a]/62">
                {update.detail}
              </p>
              <p className="mt-4 rounded-2xl bg-stadium p-4 text-sm font-bold leading-6 text-[#10131a]/70">
                {update.impact}
              </p>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
