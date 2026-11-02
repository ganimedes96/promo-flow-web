import { Connections } from "./components/connections";
export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const { platform } = await searchParams;
  return <Connections initialTelegramOpen={platform === "telegram"} />;
}
