import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/next-auth/auth";
import { redirect } from "next/navigation";
import { Nav } from "./nav";

export async function AppSidebar() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { permissions } = session.user;

  return (
    <Sidebar>
      <SidebarHeader className="border-sidebar-border flex h-16 justify-center border-b">
        <div className="flex items-center justify-center gap-6 px-2">
          <span className="text-xl font-semibold">PromoFlow</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Nav permissions={permissions} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
