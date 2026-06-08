import { TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageIntro } from "@/components/ui";
import { getPredictionHub } from "@/lib/pulse90-data";

export default async function PredictionsPage() {
  const { predictions } = await getPredictionHub();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro
          kicker="Prediction pulse"
          title="Movement with reasons, not odds noise."
          detail="Predictions should explain why confidence changed so they become context, not clutter."
        />
        {!predictions.length ? (
          <div className="mt-6 rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5">
            <p className="text-xl font-black text-[#10131a]">No prediction records yet.</p>
            <p className="mt-2 text-sm leading-6 text-[#10131a]/58">
              This page will populate after the first editorial or model prediction import.
            </p>
          </div>
        ) : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {predictions.map((prediction) => {
            const Icon = prediction.tone === "up" ? TrendingUp : TrendingDown;
            return (
              <article className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5" key={prediction.subject}>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#10131a]/42">
                  {prediction.label}
                </p>
                <h2 className="mt-4 text-2xl font-black text-[#10131a]">
                  {prediction.subject}
                </h2>
                <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#10131a]/5 px-3 py-1 text-sm font-black text-cobalt">
                  <Icon className="size-4" />
                  {prediction.movement}
                </span>
                <p className="mt-4 text-sm leading-6 text-[#10131a]/58">
                  Changed because the current path shifted the bracket and pressure windows.
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
