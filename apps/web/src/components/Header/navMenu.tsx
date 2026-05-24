import NavMenuItem from "./navMenuItem";
import MobileMenu from "./mobileMenu";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/about", label: "Sobre" },
  { href: "/projects", label: "Projetos" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contato" },
];

export default function NavMenu() {
  return (
    <nav className="max-w-full flex items-center gap-6">
      {/* Desktop */}
      <ul className="hidden md:flex gap-4 items-center">
        {navItems.map((item) => (
          <NavMenuItem key={item.href} href={item.href} label={item.label} />
        ))}
      </ul>

      {/* Mobile */}
      <div className="md:hidden">
        <MobileMenu />
      </div>
    </nav>
  );
}
