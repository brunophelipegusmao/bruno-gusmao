import { Button } from "@base-ui/react/button";
import FeaturedCard from "@/components/Common/featuredCard";
import CommonGrid, { GridItem } from "@/components/Common/commonGrid";
import Footer from "@/components/Common/footer";
import { TypingAnimation } from "@/components/ui/typing-animation";

const projects: GridItem[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  image: { src: "https://picsum.photos/seed/picsum/200/300", alt: "Project cover" },
  title: "Projeto X",
  description: "Descrição breve do projeto, destacando as tecnologias utilizadas e os desafios enfrentados.",
  badges: ["NextJs"],
  actions: [
    { label: "Ver Projeto" },
    { label: "Repositório" },
  ],
}));

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
          <FeaturedCard
            image={{ src: "/projects_mock/jm-frontend.webp", alt: "Juliana Martins - Fitness Studio" }}
            title="Juliana Martins - Fitness Studio"
            description="Sistema personalizado para estudo com foco no bem estar e emagrecimento: controle de alunos, check-ins, gestão financeira e dashboards por perfil."
            badges={["NextJs", "NestJs", "TailwindCSS", "TypeScript", "DrizzleORM", "PostgreSQL", "BetterAuth", "Zod", "Cloudinary"]}
          >
            <Button className="bg-background text-foreground py-3 px-4 rounded-xl">
              Ver Projeto
            </Button>
            <Button className="bg-background text-foreground py-3 px-4 rounded-xl">
              Repositório
            </Button>
          </FeaturedCard>
        </div>
      </section>

      <CommonGrid items={projects} />

      <Footer />
    </main>
  );
}
