"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/about", label: "Sobre" },
  { href: "/projects", label: "Projetos" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contato" },
];

export default function MobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Abrir menu"
        className="flex items-center gap-2 bg-foreground text-secondary font-heading uppercase text-sm px-3 py-2.5 rounded-xl hover:bg-foreground/80 transition-colors outline-none"
      >
        <Menu className="w-4 h-4" />
        Menu
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-52 flex flex-col gap-1.5 rounded-xl border border-border bg-background p-2"
      >
        {navItems.map((item) => (
          <DropdownMenuItem
            key={item.href}
            asChild
            className="rounded-xl p-0 focus:bg-transparent"
          >
            <Link
              href={item.href}
              className="flex w-full items-center justify-center bg-foreground text-secondary font-heading uppercase text-base px-3 py-3 rounded-xl hover:bg-foreground/80 transition-colors"
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
