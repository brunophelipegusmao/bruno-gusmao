import { Button } from "@base-ui/react/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ShineBorder } from "./ui/shine-border";

export default function FeaturedCard() {
  return (
    <Card className="relative w-1/2 mx-auto pt-0 bg-card-foreground">
      <ShineBorder shineColor={["#e2e8f0", "#818cf8", "#c4b5fd"]} className="z-40" />
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src="/projects_mock/jm-frontend.webp"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-80 hover:grayscale dark:brightness-40"
      />
      <CardHeader className="flex flex-col gap-3">
        <CardTitle className="text-secondary font-semibold pb-3 bg-card-foreground">
          Juliana Martins - Fitness Studio
        </CardTitle>
        <CardDescription className="">
          Sistema personalizado para estudo com foco no bem estar e
          emagrecimento: controle de alunos, check-ins, gestão financeira e
          dashboards por perfil.
        </CardDescription>
        <CardAction className="flex flex-wrap gap-2 pt-3">
          <Badge variant="default">NextJs</Badge>
          <Badge variant="secondary">NestJs</Badge>
          <Badge variant="secondary">TailwindCSS</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">DrizzleORM</Badge>
          <Badge variant="secondary">PostgreSQL</Badge>
          <Badge variant="secondary">BetterAuth</Badge>
          <Badge variant="secondary">Zod</Badge>
          <Badge variant="secondary">Cloudinary</Badge>
        </CardAction>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">Ver Projeto</Button>
        <Button className="w-full">Repositório</Button>
      </CardFooter>
    </Card>
  );
}
