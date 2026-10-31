import { fetchServer } from "@/api/server";
import { ApiResponse } from "@/api/types";
import { redirect } from "next/navigation";
import { SourcesManager } from "./components/sources-manager";
export default async function PromotionSourcesPage() {
  const response = await fetchServer<ApiResponse<{ role: string }>>("/auth/me");
  if (response.data.role !== "admin") redirect("/forbidden");
  return <SourcesManager />;
}
