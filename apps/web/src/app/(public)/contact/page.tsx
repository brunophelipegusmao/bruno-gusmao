import type { Metadata } from "next";
import { Mail, Code2, Briefcase } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import ContactForm from "@/components/Contact/contactForm";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com Bruno Gusmão — disponível para projetos freelance, colaborações e oportunidades.",
  openGraph: {
    title: "Contato | Bruno Gusmão",
    description:
      "Entre em contato com Bruno Gusmão para projetos freelance, colaborações e oportunidades.",
    url: "https://brunogusmao.dev/contact",
  },
};
import Footer from "@/components/Common/footer";

const contactLinks = [
  {
    Icon: Mail,
    label: "E-mail",
    value: "bruno.mulim.prog@gmail.com",
    href: "mailto:bruno.mulim.prog@gmail.com",
  },
  {
    Icon: Code2,
    label: "GitHub",
    value: "github.com/brunophelipegusmao",
    href: "https://github.com/brunophelipegusmao",
  },
  {
    Icon: Briefcase,
    label: "LinkedIn",
    value: "linkedin.com",
    href: "https://linkedin.com/in/bruno-mulim",
  },
];

export default function Contact() {
  return (
    <main className="flex flex-col items-center justify-center max-w-[80%] gap-6 m-auto">
      <div className="flex items-start w-full py-2">
        <TypingAnimation
          duration={200}
          className="font-heading font-semibold text-primary text-6xl text-left"
          aria-hidden="true"
        >
          CONTATO_
        </TypingAnimation>
      </div>
      <h3 className="text-left w-full">
        {"> "}Vamos trabalhar juntos
      </h3>

      <div className="flex flex-col md:flex-row gap-12 w-full py-4">
        <div className="flex flex-col gap-8 md:w-2/5">
          <p className="text-muted-foreground leading-relaxed">
            Tem um projeto em mente, uma dúvida ou quer apenas trocar uma ideia?
            Me manda uma mensagem.
          </p>

          <ul className="flex flex-col gap-5">
            {contactLinks.map(({ Icon, label, value, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading uppercase text-xs font-bold tracking-wide text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                      {value}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1">
          <ContactForm />
        </div>
      </div>

      <Footer />
    </main>
  );
}
