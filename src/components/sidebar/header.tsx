import { authOptions } from "@/lib/next-auth/auth";
import { getServerSession } from "next-auth";
import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarTrigger } from "../ui/sidebar";
import { ButtonLogout } from "./button-logout";
import { Pathname } from "./pathname";
import { ToggleTheme } from "./toggle-theme";

interface HeaderProps {
  children?: React.ReactNode;
}

export async function Header({ children }: HeaderProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const { name } = session.user;

  return (
    <header className="bg-sidebar border-divider sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b px-6 print:hidden">
      <div className="flex flex-row items-center gap-6">
        <SidebarTrigger className="h-7 w-7" />
        <h1 className="text-xl font-semibold">{<Pathname />}</h1>
      </div>
      <div className="flex items-center justify-end gap-4">
        {children}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="text-primary rounded-full"
            >
              <Avatar>
                <AvatarImage
                  className="object-cover"
                  src={
                    "https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-Free-PNG.png"
                  }
                  alt=""
                />
                <AvatarFallback>{"PI"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Olá {name} 👋</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ToggleTheme />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ButtonLogout asMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
