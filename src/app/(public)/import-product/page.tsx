import { getServerSession } from "@/lib/next-auth/auth";
import { ProductImport } from "./components/product-import";
export default async function ImportProductPage() {
  const session = await getServerSession();
  return <ProductImport authenticated={Boolean(session?.user)} />;
}
