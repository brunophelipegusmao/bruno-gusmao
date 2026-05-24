import FeaturedCard from "@/components/featuredCard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardAction,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { Button } from "@base-ui/react";

export default function Projects() {
  return (
    <main className="flex flex-col items-center justify-center max-w-[80%] gap-6 m-auto ">
      <div className="flex items-start w-full py-2">
        <TypingAnimation
          duration={200}
          className="font-heading font-semibold text-primary text-6xl text-left"
          aria-hidden="true"
        >
          PROJETOS_
        </TypingAnimation>
      </div>
      <h3 className="text-left w-full">
        {"> "}Projetos feitos em cursos e freelances
      </h3>
      <section className="w-full p">
        <TypingAnimation
          duration={200}
          className="font-heading font-semibold text-primary text-2xl text-left"
          aria-hidden="true"
        >
          PROJETO EM DESTAQUE_
        </TypingAnimation>

        <div className="mt-6 py-6">
          <FeaturedCard />
        </div>
      </section>
    </main>
  );
}
