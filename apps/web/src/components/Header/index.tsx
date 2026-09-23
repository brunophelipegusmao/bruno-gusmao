import Image from "next/image";
import Link from "next/link";
import NavMenu from "./navMenu";
import { EventButton } from "./eventButton";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <header className="w-[80%] mx-auto h-22 bg-transparent flex items-center justify-between px-4 border-b-3 border-background">
      <div>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="Bruno Gusmão Card"
            width={50}
            height={50}
            loading="eager"
          />
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <EventButton />
        <ThemeToggle />
        <NavMenu />
      </div>
    </header>
  );
}
