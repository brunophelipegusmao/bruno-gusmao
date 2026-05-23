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
        className="flex items-center justify-center w-10 h-10 rounded-xl border border-foreground/20 bg-foreground/5 hover:bg-foreground/10 transition-colors outline-none"
      >
        <Menu className="w-5 h-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-48 flex flex-col gap-0.5 rounded-2xl border border-border bg-background/80 backdrop-blur-md p-2 shadow-lg"
      >
        {navItems.map((item) => (
          <DropdownMenuItem
            key={item.href}
            asChild
            className="rounded-xl p-0 focus:bg-foreground/5 focus:text-foreground"
          >
            <Link
              href={item.href}
              className="flex w-full items-center px-4 py-3 font-heading uppercase text-sm tracking-wide text-foreground hover:bg-foreground/5 rounded-xl transition-colors"
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
