import { Button } from "@base-ui/react/button";
import FeaturedCard from "@/components/Common/featuredCard";
import CommonGrid, { GridItem } from "@/components/Common/commonGrid";
import { TypingAnimation } from "@/components/ui/typing-animation";

const posts: GridItem[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  image: { src: "https://picsum.photos/seed/blog/200/300", alt: "Post cover" },
  title: "Título do Post",
  description: "Descrição breve do artigo, destacando os principais tópicos abordados.",
  badges: ["NestJS", "TypeScript"],
  actions: [{ label: "Ler Artigo" }],
}));

export default function Blog() {
  return (
    <main className="flex flex-col items-center justify-center max-w-[80%] gap-6 m-auto">
      <div className="flex items-start w-full py-2">
        <TypingAnimation
          duration={200}
          className="font-heading font-semibold text-primary text-6xl text-left"
          aria-hidden="true"
        >
          BLOG_
        </TypingAnimation>
      </div>
      <h3 className="text-left w-full">
        {"> "}Artigos sobre desenvolvimento e tecnologia
      </h3>
      <section className="w-full">
        <TypingAnimation
          duration={200}
          className="font-heading font-semibold text-primary text-2xl text-left"
          aria-hidden="true"
        >
          POST EM DESTAQUE_
        </TypingAnimation>

        <div className="mt-6 py-6">
          <FeaturedCard
            image={{ src: "https://picsum.photos/seed/blog/800/450", alt: "Post em destaque" }}
            title="Construindo uma API REST escalável com NestJS e DrizzleORM"
            description="Um guia prático sobre como estruturar projetos backend de forma escalável, com foco em boas práticas de arquitetura, validação e performance em produção."
            badges={["NestJS", "DrizzleORM", "PostgreSQL", "TypeScript"]}
          >
            <Button className="bg-background text-foreground py-3 px-4 rounded-xl">
              Ler Artigo
            </Button>
          </FeaturedCard>
        </div>
      </section>

      <CommonGrid items={posts} />

      <footer className="h-30 bg-amber-200">teste</footer>
    </main>
  );
}
