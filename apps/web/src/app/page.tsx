import type { Metadata } from "next";
import { AnimatedList } from "@/components/ui/animated-list";
import { TypingAnimation } from "@/components/ui/typing-animation";

export const metadata: Metadata = {
  title: "Bruno Gusmão",
  description:
    "Desenvolvedor full-stack especializado em NestJS, Next.js e TypeScript. Conheça meus projetos e trajetória.",
  openGraph: {
    title: "Bruno Gusmão — Desenvolvedor Full-Stack",
    description:
      "Desenvolvedor full-stack especializado em NestJS, Next.js e TypeScript.",
    url: "https://brunogusmao.dev",
  },
};

const itensList = [
  { label: "JavaScript", image: "icons/javascript.svg" },
  { label: "TypeScript", image: "icons/typescript.svg" },
  { label: "React", image: "icons/react.svg" },
  { label: "Node.js", image: "icons/nodejs.svg" },
  { label: "Next.js", image: "icons/nextjs.svg" },
  { label: "postgreSQL", image: "icons/postgresql.svg" },
  { label: "Docker", image: "icons/docker.svg" },
  { label: "Angular", image: "icons/angular.svg" },
  { label: "Java", image: "icons/java.svg" },
  { label: "NestJS", image: "icons/nestjs.svg" },
  { label: "React Native", image: "icons/react-2.svg" },
];

export default function Home() {
  return (
    <main className="flex flex-col gap-4 items-center justify-between">
      <div className="relative px-6 sm:px-8 md:px-16 flex-1 flex flex-col justify-center w-full py-10 sm:py-12 md:py-0">
        <p className="hero-role mb-3 md:mb-6 text-lg sm:text-2xl md:text-3xl">
          <span className="hero-role-prefix" aria-hidden="true">
            ›{" "}
          </span>
          Portfolio pessoal
        </p>
        <div className="select-none w-full">
          <TypingAnimation
            duration={200}
            className="hero-name-bruno px-2.5 font-heading font-semibold text-[#3C71C8]"
            aria-hidden="true"
          >
            BRUNO
          </TypingAnimation>
          <TypingAnimation
            duration={200}
            className="hero-name-gusmao px-2.5 font-heading font-semibold"
            aria-hidden="true"
            delay={6}
          >
            GUSMÃO
          </TypingAnimation>
        </div>
        <div className="hero-divider" />
        <p className="hero-role text-lg py-3 sm:text-2xl md:text-3xl">
          <span className="hero-role-prefix" aria-hidden="true">
            _
          </span>
          Desenvolvedor Full Stack
        </p>
      </div>
      <div className="w-full px-6 sm:px-8 md:px-16 pb-10 sm:pb-12">
        <p className="py-3 text-xl sm:text-2xl md:text-3xl">_Stacks</p>
        <AnimatedList
          className="flex-row flex-wrap items-start justify-start gap-2 sm:gap-3"
          delay={1000}
        >
          {itensList.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-1.5"
            >
              <img src={item.image} alt={item.label} className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-xs sm:text-sm">{item.label}</span>
            </div>
          ))}
        </AnimatedList>
      </div>
    </main>
  );
}
