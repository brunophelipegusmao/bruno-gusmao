import { ReactNode } from "react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface CommonCardProps {
  image: { src: string; alt: string };
  title: string;
  description: string;
  badges: string[];
  children: ReactNode;
}

export default function CommonCard({
  image,
  title,
  description,
  badges,
  children,
}: CommonCardProps) {
  return (
    <Card className="relative w-full pt-0 bg-secondary">
      <div className="absolute inset-0 z-30 aspect-video bg-black/20" />
      <img
        src={image.src}
        alt={image.alt}
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader className="flex flex-col gap-3">
        <CardTitle className="text-primary font-semibold pb-3">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
        <CardAction className="flex flex-wrap gap-2 pt-3">
          {badges.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))}
        </CardAction>
      </CardHeader>
      <CardFooter>
        <div className="flex items-center justify-around w-full">
          {children}
        </div>
      </CardFooter>
    </Card>
  );
}
