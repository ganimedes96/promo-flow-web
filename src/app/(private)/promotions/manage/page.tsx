import { fetchServer } from "@/api/server";
import { ApiResponse } from "@/api/types";
import { redirect } from "next/navigation";
import { PromotionsCatalog } from "../components/catalog";
export default async function ManagePromotionsPage() {
  const response = await fetchServer<ApiResponse<{ role: string }>>("/auth/me");
  if (response.data.role !== "admin") redirect("/forbidden");
  return <PromotionsCatalog manage />;
}
