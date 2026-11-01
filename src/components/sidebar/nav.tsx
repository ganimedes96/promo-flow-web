"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { Permission } from "@/domains/auth/enums";
import { cn } from "@/lib/shadcn/utils";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  getAccessibleNavItems,
  getAccessibleNavSections,
  NavSection,
} from "./helpers";
import styles from "./nav.module.css";
interface NavProps {
  permissions: Permission[];
}
export function Nav({ permissions }: NavProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const accessible = getAccessibleNavItems(permissions);
  const sections = getAccessibleNavSections(permissions);
  const activeHref = accessible
    .filter(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const overview = accessible.find((item) => item.href === "/control-panel");
  const navigate = () => {
    if (isMobile) setOpenMobile(false);
  };
  return (
    <nav aria-label="Menu principal" className="p-3">
      <SidebarMenu className="gap-2">
        {overview && (
          <SidebarMenuItem className="border-sidebar-border mb-2 border-b pb-3">
            <SidebarMenuButton
              asChild
              isActive={activeHref === overview.href}
              className="h-10 rounded-xl"
            >
              <Link
                prefetch
                href={overview.href}
                aria-current={activeHref === overview.href ? "page" : undefined}
                onClick={navigate}
              >
                {overview.icon}
                <span>{overview.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {sections.map((section) => (
          <NavCategory
            key={section.id}
            section={section}
            pathname={pathname}
            activeHref={activeHref}
            onNavigate={navigate}
          />
        ))}
      </SidebarMenu>
    </nav>
  );
}
function NavCategory({
  section,
  pathname,
  activeHref,
  onNavigate,
}: {
  section: NavSection;
  pathname: string;
  activeHref?: string;
  onNavigate: () => void;
}) {
  const active = section.items.some((item) => item.href === activeHref);
  const [choice, setChoice] = useState<{
    pathname: string;
    open: boolean;
  } | null>(null);
  // A route change reveals its category; the user can still close it on that route.
  const open =
    choice?.pathname === pathname
      ? choice.open
      : active || (choice?.open ?? section.id === "offers");
  return (
    <Collapsible.Root
      asChild
      open={open}
      onOpenChange={(next) => setChoice({ pathname, open: next })}
    >
      <SidebarMenuItem>
        <Collapsible.Trigger asChild>
          <SidebarMenuButton
            className={cn(
              "h-10 rounded-xl font-medium",
              active && "bg-primary/5 text-primary"
            )}
          >
            <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-lg [&>svg]:size-4">
              {section.icon}
            </span>
            <span className="text-primary flex-1 text-[11px] font-bold tracking-widest uppercase">
              {section.title}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "text-muted-foreground ml-auto size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                open && "rotate-180"
              )}
            />
          </SidebarMenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content className={styles.content}>
          <SidebarMenuSub className="my-1 gap-1 py-1">
            {section.items.map((item) => (
              <SidebarMenuSubItem key={item.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={activeHref === item.href}
                  className="h-9 gap-2.5 rounded-lg"
                >
                  <Link
                    prefetch
                    href={item.href}
                    aria-current={activeHref === item.href ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </Collapsible.Content>
      </SidebarMenuItem>
    </Collapsible.Root>
  );
}
