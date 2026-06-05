import Card from "@/components/Card";
import { ThemeProvider } from "@/components/ThemeProvider";
import { resolveInvitationData } from "@/lib/utils";

interface CardPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CardPage({ params, searchParams }: CardPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const invitation = resolveInvitationData(id, resolvedSearchParams);

  return (
    <ThemeProvider theme={invitation.theme}>
      <main className="card-view">
        <Card invitation={invitation} />
      </main>
    </ThemeProvider>
  );
}
