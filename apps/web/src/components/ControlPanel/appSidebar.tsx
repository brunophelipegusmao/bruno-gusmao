"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Tag,
  Kanban,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { TypingAnimation } from "../ui/typing-animation";

const NAV_PAINEL = [
  { label: "Dashboard", href: "/ControlPanel", icon: LayoutDashboard },
];

const NAV_CONTEUDO = [
  { label: "Projetos", href: "/ControlPanel/projects", icon: FolderKanban },
  { label: "Posts", href: "/ControlPanel/posts", icon: FileText },
  { label: "Badges", href: "/ControlPanel/badges", icon: Tag },
];

const NAV_ORGANIZACAO = [
  { label: "Kanban", href: "/ControlPanel/kanban", icon: Kanban },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === "/ControlPanel" ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2 px-1">
          <TypingAnimation className="font-heading text-primary text-base tracking-widest group-data-[collapsible=icon]:hidden">
              PAINEL_
          </TypingAnimation>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Painel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_PAINEL.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={isActive(href)}
                    tooltip={label}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conteúdo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_CONTEUDO.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={isActive(href)}
                    tooltip={label}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Organização</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ORGANIZACAO.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={isActive(href)}
                    tooltip={label}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sair"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-heading truncate text-foreground">
                  {session?.user?.name ?? "Usuário"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Sair da conta
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
