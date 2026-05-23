import Link from "next/link";
import { HyperText } from "../ui/hyper-text";

type NavMenuItemProps = {
  href: string;
  label: string;
};

export default function NavMenuItem({ href, label }: NavMenuItemProps) {
  return (
    <li className="">
      <Link href={href}>
        <HyperText className="text-sm min-w-30 bg-foreground uppercase font-heading px-2 py-3 rounded-xl text-secondary text-center hover:bg-foreground/80 transition-colors">
          {label}
        </HyperText>
      </Link>
    </li>
  );
}
