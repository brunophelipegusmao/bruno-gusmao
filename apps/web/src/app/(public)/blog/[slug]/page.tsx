import Footer from "@/components/Common/footer";
import { Badge } from "@/components/ui/badge";
import { TypingAnimation } from "@/components/ui/typing-animation";

const post = {
  title: "Construindo uma API REST escalável com NestJS e DrizzleORM",
  date: "20 de maio de 2025",
  readTime: "8 min de leitura",
  image: null as { src: string; alt: string } | null,
  badges: ["NestJS", "DrizzleORM", "PostgreSQL", "TypeScript"],
  content: `
    Construir uma API escalável vai muito além de simplesmente expor endpoints. É preciso pensar
    em estrutura, contratos, validação e — acima de tudo — em como o código vai se comportar
    quando o volume crescer.

    Neste artigo vamos percorrer as decisões que tomei ao estruturar uma API com NestJS e
    DrizzleORM: desde a organização dos módulos até a estratégia de migrations e os padrões
    de repositório que facilitam os testes.

    ## Por que NestJS?

    NestJS traz para o Node.js o que o Spring Boot trouxe para o Java: convenções sólidas,
    injeção de dependência nativa e uma CLI que gera a estrutura certa sem deixar o projeto
    engessado. A camada de decorators reduz o boilerplate e deixa o código mais legível.

    ## Por que DrizzleORM?

    Drizzle é um ORM type-safe que não esconde o SQL. Ele gera queries previsíveis, tem suporte
    nativo a PostgreSQL e o schema em TypeScript serve ao mesmo tempo como fonte de verdade e
    como documentação viva do banco.

    ## Organização dos módulos

    Cada domínio tem seu próprio módulo: controller, service, repository e schema. Isso evita
    acoplamento horizontal e facilita isolar responsabilidades nos testes.

    ## Migrations com Drizzle Kit

    O drizzle-kit gera migrations a partir do diff entre o schema atual e o estado do banco.
    Nenhuma migration manual — apenas \`drizzle-kit generate\` e \`drizzle-kit migrate\`.

    ## Conclusão

    A combinação NestJS + DrizzleORM entrega produtividade sem sacrificar controle. O resultado
    é uma API com tipagem ponta a ponta, migrations rastreáveis e estrutura que cresce com o projeto.
  `,
};

export default function BlogPost() {
  const blocks = post.content
    .trim()
    .split("\n\n")
    .map((b) => b.trim())
    .filter(Boolean);
  const firstSection = blocks.findIndex((b) => b.startsWith("## "));
  const introBlocks =
    firstSection === -1 ? blocks : blocks.slice(0, firstSection);
  const sectionBlocks = firstSection === -1 ? [] : blocks.slice(firstSection);

  return (
    <main className="flex flex-col items-center justify-center max-w-[80%] gap-6 m-auto">
      <div className="flex items-start w-full py-2">
        <TypingAnimation
          duration={200}
          className="font-heading font-semibold text-primary text-6xl text-left"
          aria-hidden="true"
        >
          POST_
        </TypingAnimation>
      </div>

      <div className="flex items-center gap-4 w-full text-sm text-muted-foreground">
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.readTime}</span>
      </div>

      <h1 className="w-full font-heading font-semibold text-2xl md:text-3xl leading-snug">
        {post.title}
      </h1>

      <div className="flex flex-wrap gap-2 w-full">
        {post.badges.map((badge) => (
          <Badge key={badge} variant="secondary">
            {badge}
          </Badge>
        ))}
      </div>

      <div className={`flex w-full ${post.image ? "flex-col gap-9 md:flex-row" : "flex-col"}`}>
        {post.image && (
          <div className="relative shrink-0 w-full md:w-100 h-50 md:h-75 rounded-xl overflow-hidden">
            <div className="absolute inset-0 z-10 bg-black/20" />
            <img
              src={post.image.src}
              alt={post.image.alt}
              className="w-full h-full object-cover brightness-80 dark:brightness-50"
              width={400}
              height={300}
            />
          </div>
        )}

        <div className={`flex flex-col items-start justify-center gap-4 ${post.image ? "mt-6 md:mt-0 md:pl-10" : ""}`}>
          {introBlocks.map((block, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {block}
            </p>
          ))}
        </div>
      </div>

      <article className="w-full">
        {sectionBlocks.map((block, i) => {
          if (block.startsWith("## ")) {
            return (
              <h2
                key={i}
                className="font-heading font-semibold text-xl text-primary mt-8 mb-3"
              >
                {block.replace("## ", "")}
              </h2>
            );
          }
          return (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4">
              {block}
            </p>
          );
        })}
      </article>

      <Footer />
    </main>
  );
}
