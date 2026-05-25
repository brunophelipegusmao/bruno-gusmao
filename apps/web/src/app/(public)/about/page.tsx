import Image from "next/image";
import Footer from "@/components/Common/footer";
import {
  Briefcase,
  GraduationCap,
  Scale,
  Code2,
  Landmark,
  Building2,
} from "lucide-react";
import DownloadButton from "@/components/Projects/downloaderButton";

type TimelineItemType = {
  year: string;
  title: string;
  description: string;
  Icon: React.ElementType;
};

const timelineItems: TimelineItemType[] = [
  {
    year: "Atual",
    title: "Desenvolvedor Freelancer",
    description:
      "Frontend ao Backend — React, Next.js, Node.js, NestJS, TypeScript e Docker.",
    Icon: Code2,
  },
  {
    year: "2024",
    title: "Estagiário de IT",
    description: "Ministério Público do Trabalho — suporte técnico e HelpDesk.",
    Icon: Building2,
  },
  {
    year: "2022 – 2024",
    title: "Técnico em ADS",
    description: "Universidade Veiga de Almeida, Rio de Janeiro.",
    Icon: GraduationCap,
  },
  {
    year: "2021 – Atual",
    title: "Advogado",
    description:
      "Mulim Advogados e Associados — contencioso civil e gestão de escritório.",
    Icon: Scale,
  },
  {
    year: "2018 – 2021",
    title: "Advogado",
    description: "IMA Advocacia — peças processuais e sustentação oral.",
    Icon: Briefcase,
  },
  {
    year: "2014",
    title: "Conciliador",
    description: "Tribunal de Justiça — 1ª Vara Cível de Duque de Caxias.",
    Icon: Landmark,
  },
  {
    year: "2009 – 2015",
    title: "Licenciatura em Direito",
    description: "Universidade UNIGRANRIO, Rio de Janeiro.",
    Icon: GraduationCap,
  },
  {
    year: "2007 – 2011",
    title: "Estagiário",
    description:
      "Natalino de Abreu Advocacia — primeiros passos no contencioso civil.",
    Icon: Briefcase,
  },
];

export default function About() {
  return (
    <main className="flex flex-col justify-center items-center p-6 md:p-12 gap-3.5">
      <section className="flex flex-col md:flex-row w-full items-center justify-center gap-8 p-3">
        <article className="w-full md:w-1/3 p-3 flex flex-col items-start justify-start gap-4">
          <h1 className="text-3xl font-bold text-left pb-2">
            Um pouco sobre mim
          </h1>
          <p>
            Advogado com mais de uma década de atuação — na Defensoria Pública,
            no contencioso civil e na gestão do próprio escritório —, sempre
            carreguei junto à carreira jurídica uma curiosidade persistente por
            tecnologia. Montar computadores, explorar sistemas e acompanhar o
            avanço do desenvolvimento de software nunca foram apenas
            passatempos: eram sinais de onde eu queria chegar.
          </p>
          <p>
            Em 2022, decidi transformar esse interesse em formação técnica.
            Cursei Análise e Desenvolvimento de Sistemas e, desde então, atuo
            como desenvolvedor freelancer — do frontend ao backend — com stack
            moderna: React, Next.js, Node.js, NestJS, TypeScript e Docker, entre
            outras.
          </p>
          <p>
            Hoje opero na interseção entre Direito e Tecnologia: com raciocínio
            analítico treinado pelo Direito e capacidade técnica construída na
            prática. Essa combinação não é comum — e é exatamente o que me
            diferencia.
          </p>
        </article>
        <div className="w-full md:w-1/3 pb-4 flex items-center justify-center">
          <Image
            src="/me.png"
            alt="Foto de perfil"
            width={900}
            height={900}
            className="rounded-full overflow-hidden object-cover w-56 h-56 md:w-96 md:h-96"
          />
        </div>
      </section>

      <div>
        <DownloadButton />
      </div>

      <section className="w-full px-3 pb-8">
        <h2 className="font-heading uppercase text-xl font-bold text-center mb-14 tracking-widest">
          Trajetória
        </h2>

        <div className="relative">
          {/* Linha vertical — desktop (centro) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
          {/* Linha vertical — mobile (esquerda) */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border md:hidden" />

          <ul className="flex flex-col">
            {timelineItems.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <li key={index} className="relative mb-10">
                  {/* Desktop — alterna esquerda/direita */}
                  <div className="hidden md:grid grid-cols-[1fr_9rem_1fr] items-center gap-4">
                    <div className="flex justify-end">
                      <div
                        className={`text-right max-w-65 ${!isEven ? "invisible" : ""}`}
                      >
                        <p className="font-heading uppercase text-xs font-bold tracking-wide">
                          {item.title}
                        </p>
                        <p className="text-xs text-foreground/50 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-foreground text-secondary flex items-center justify-center shrink-0 z-10">
                        <item.Icon className="w-4 h-4" />
                      </div>
                      <span className="font-heading uppercase text-xs font-bold tracking-wide">
                        {item.year}
                      </span>
                    </div>

                    <div className="flex justify-start">
                      <div
                        className={`text-left max-w-[260px] ${isEven ? "invisible" : ""}`}
                      >
                        <p className="font-heading uppercase text-xs font-bold tracking-wide">
                          {item.title}
                        </p>
                        <p className="text-xs text-foreground/50 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:hidden items-start gap-4 pl-14">
                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-foreground text-secondary flex items-center justify-center z-10 shrink-0">
                      <item.Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-heading uppercase text-[10px] text-foreground/50 tracking-wide">
                        {item.year}
                      </span>
                      <p className="font-heading uppercase text-xs font-bold tracking-wide mt-0.5">
                        {item.title}
                      </p>
                      <p className="text-xs text-foreground/50 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
