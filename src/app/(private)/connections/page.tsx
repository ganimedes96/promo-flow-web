import { Connections } from "./list/connections";
export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const { platform } = await searchParams;
  return <Connections initialTelegramOpen={platform === "telegram"} />;
}
