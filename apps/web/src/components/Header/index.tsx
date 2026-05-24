import Image from "next/image";
import Link from "next/link";
import NavMenu from "./navMenu";

export default function Header() {
  return (
    <header className="w-[80%] mx-auto h-22 bg-background flex items-center justify-between px-4 border-b-3 border-background">
      <div>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.svg"
            alt="Bruno Gusmão Card"
            width={50}
            height={50}
            loading="eager"
          />
        </Link>
      </div>
      <NavMenu />
    </header>
  );
}
