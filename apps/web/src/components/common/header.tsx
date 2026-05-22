import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full h-18 bg-background flex items-center justify-between px-4 border-b-3 border-background">
      <div className="p-2 border-b-3 border-background">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/card-limpo.svg"
            alt="Bruno Gusmão Card"
            width={210}
            height={150}
            className="border-b-3 border-background"
          />
        </Link>
      </div>
      <div className="">
        <ul className="flex gap-4 justify-around items-center">
          <li className="min-w-40">
            <Link href="/">Início</Link>
          </li>
          <li className="min-w-40">
            <Link href="/about">Sobre</Link>
          </li>
          <li className="min-w-40">
            <Link href="/blog">Blog</Link>
          </li>
          <li className="min-w-40">
            <Link href="/contact">Contato</Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
