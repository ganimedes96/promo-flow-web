import { fetchServer } from "@/api/server";
import { ApiResponse } from "@/api/types";
import { getServerSession } from "@/lib/next-auth/auth";
import { ProductImport } from "./components/product-import";
export default async function ImportProductPage() {
  const session = await getServerSession();
  let isAdmin = false;
  if (session?.user) {
    try {
      const response = await fetchServer<ApiResponse<{ role: string }>>(
        "/auth/me",
        { cache: "no-store" }
      );
      isAdmin = response.data.role === "admin";
    } catch {
      isAdmin = false;
    }
  }
  return (
    <ProductImport
      authenticated={Boolean(session?.user)}
      isAdmin={isAdmin}
      currentUserId={session?.user?.id}
    />
  );
}
