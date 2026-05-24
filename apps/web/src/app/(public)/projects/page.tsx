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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

      <section className="w-full px-3 pb-8 grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card> </Card>
        <Card> </Card>
        <Card> </Card>
        <Card> </Card>
        <Card> </Card>
        <Card> </Card>
        <Card> </Card>
        <Card> </Card>
        <Card> </Card>
      </section>
      <div className="py-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <footer className="h-30 bg-amber-200">teste</footer>
    </main>
  );
}
