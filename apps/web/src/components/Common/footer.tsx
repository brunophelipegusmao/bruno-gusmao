import Link from "next/link";
import { Code2, Briefcase, Mail } from "lucide-react";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/about", label: "Sobre" },
  { href: "/projects", label: "Projetos" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contato" },
];

const socialLinks = [
  { href: "https://github.com/brunogusmao", label: "GitHub", Icon: Code2 },
  { href: "https://linkedin.com/in/brunogusmao", label: "LinkedIn", Icon: Briefcase },
  { href: "mailto:bruno.mulim.prog@gmail.com", label: "E-mail", Icon: Mail },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-border mt-6 pt-10 pb-8 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="flex flex-col gap-3">
          <span className="font-heading font-semibold text-primary text-sm tracking-widest uppercase">
            Navegação
          </span>
          <ul className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {"> "}{link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-start md:items-center gap-2">
          <span className="font-heading font-semibold text-primary text-2xl tracking-tight">
            Bruno Gusmão_
          </span>
          <p className="text-sm text-muted-foreground">Desenvolvedor & <Link href="https://www.mulimassociados.adv.br" target="_blank" rel="noopener noreferrer">Advogado</Link></p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-heading font-semibold text-primary text-sm tracking-widest uppercase">
            Contato
          </span>
          <ul className="flex flex-col gap-2">
            {socialLinks.map(({ href, label, Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bruno Gusmão — Todos os direitos reservados
      </div>
    </footer>
  );
}
