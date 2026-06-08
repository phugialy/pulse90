import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageIntro } from "@/components/ui";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Plus,
  Share,
  Smartphone,
} from "lucide-react";

const iphoneSteps = [
  {
    title: "Open Pulse90 in Safari",
    detail: "Use Safari on iPhone. The home-screen option lives there.",
  },
  {
    title: "Tap the Share button",
    detail: "It is the square icon with the arrow at the bottom of Safari.",
  },
  {
    title: "Choose Add to Home Screen",
    detail: "Scroll the share sheet if you do not see it right away.",
  },
  {
    title: "Tap Add",
    detail: "Pulse90 will show up beside your regular apps.",
  },
];

const androidSteps = [
  {
    title: "Open Pulse90 in Chrome",
    detail: "Chrome usually gives the cleanest install prompt on Android.",
  },
  {
    title: "Tap the menu",
    detail: "Use the three-dot menu in the top-right corner.",
  },
  {
    title: "Tap Add to Home screen",
    detail: "Some phones may say Install app instead.",
  },
  {
    title: "Confirm Add",
    detail: "Pulse90 lands on your home screen for quick matchday access.",
  },
];

export const metadata = {
  title: "Add Pulse90 to Your Phone",
  description: "Step-by-step instructions for adding Pulse90 to iPhone or Android.",
};

export default function InstallPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          className="mb-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#10131a]/10 bg-white px-4 text-sm font-black text-[#10131a]/68 shadow-sm transition hover:text-[#10131a]"
          href="/"
        >
          <ArrowLeft className="size-4" />
          Watch Desk
        </Link>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <PageIntro
              kicker="Add Pulse90"
              title="Put the match desk on your home screen."
              detail="No app store, no account, no extra download. Add the website to your phone and open it like an app when the games start moving."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InstallSteps
                icon="iphone"
                label="iPhone"
                steps={iphoneSteps}
              />
              <InstallSteps
                icon="android"
                label="Android"
                steps={androidSteps}
              />
            </div>
          </div>

          <aside className="rounded-[28px] border border-[#10131a]/10 bg-[#10131a] p-5 text-white shadow-[0_24px_70px_rgba(25,45,88,0.18)]">
            <div className="grid size-14 place-items-center rounded-2xl bg-lime text-[#10131a]">
              <Smartphone className="size-7" />
            </div>
            <h2 className="mt-5 text-3xl font-black leading-tight">
              Want Pulse90 one tap away?
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-white/62">
              Add it once. On matchday, skip typing the URL and jump straight into fixtures,
              groups, and team pages.
            </p>
            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime">
                Best for
              </p>
              <p className="mt-2 text-lg font-black leading-tight">
                Daily checks, quick fixture lookups, and sending a friend straight to the good stuff.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}

function InstallSteps({
  icon,
  label,
  steps,
}: {
  icon: "android" | "iphone";
  label: string;
  steps: Array<{ detail: string; title: string }>;
}) {
  const Icon = icon === "iphone" ? Share : Globe;

  return (
    <section className="rounded-[28px] border border-[#10131a]/10 bg-white/88 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cobalt">
            {label}
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#10131a]">
            Add in under a minute
          </h2>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-stadium text-cobalt">
          <Icon className="size-6" />
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <article
            className="grid grid-cols-[34px_1fr] gap-3 rounded-2xl bg-stadium p-3"
            key={step.title}
          >
            <span className="grid size-8 place-items-center rounded-full bg-white text-sm font-black text-cobalt">
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 font-black text-[#10131a]">
                {step.title}
                {index === 2 ? <Plus className="size-4 text-cobalt" /> : null}
                {index === 1 ? <ExternalLink className="size-4 text-cobalt" /> : null}
              </span>
              <span className="mt-1 block text-sm font-bold leading-6 text-[#10131a]/56">
                {step.detail}
              </span>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
