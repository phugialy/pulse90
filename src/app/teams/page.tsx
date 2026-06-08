import { AppShell } from "@/components/app-shell";
import { TeamsDirectory } from "@/components/teams-directory";
import { PageIntro } from "@/components/ui";
import { getTeamsDirectory } from "@/lib/pulse90-data";

export default async function TeamsPage() {
  const { teams } = await getTeamsDirectory();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro
          kicker="Teams"
          title="Find a team."
          detail="Search by name or narrow the field by region."
        />
        <TeamsDirectory teams={teams} />
      </div>
    </AppShell>
  );
}
