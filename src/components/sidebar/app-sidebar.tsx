import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/next-auth/auth";
import { redirect } from "next/navigation";
import { Nav } from "./nav";
import { SidebarBrand } from "./brand";

export async function AppSidebar() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { permissions } = session.user;

  return (
    <Sidebar>
      <SidebarHeader className="border-sidebar-border flex h-16 justify-center border-b">
        <div className="px-3">
          <SidebarBrand />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Nav permissions={permissions} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
