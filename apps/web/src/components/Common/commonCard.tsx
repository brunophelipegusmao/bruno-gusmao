import { ReactNode } from "react";
import { CommonBadge } from "./commonBadge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import type { BadgeData } from "./featuredCard";

interface CommonCardProps {
  image?: { src: string; alt: string } | null;
  title: string;
  description: string;
  badges: BadgeData[];
  children: ReactNode;
}

export default function CommonCard({ image, title, description, badges, children }: CommonCardProps) {
  return (
    <Card className="relative w-full pt-0 bg-secondary">
      {image ? (
        <>
          <div className="absolute inset-0 z-30 aspect-video bg-black/20" />
          <img
            src={image.src}
            alt={image.alt}
            className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
          />
        </>
      ) : (
        <div className="aspect-video w-full bg-linear-to-br from-primary/10 via-secondary to-primary/5 flex items-center justify-center">
          <span className="font-heading text-primary/20 text-2xl">IMG_</span>
        </div>
      )}
      <CardHeader className="flex flex-col gap-3">
        <CardTitle className="text-primary font-semibold pb-3">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
        {badges.length > 0 && (
          <CardAction className="flex flex-wrap gap-1.5 pt-3">
            {badges.map((b) => (
              <CommonBadge key={b.name} name={b.name} bgColor={b.bgColor} textColor={b.textColor} />
            ))}
          </CardAction>
        )}
      </CardHeader>
      <CardFooter>
        <div className="flex items-center justify-around w-full">{children}</div>
      </CardFooter>
    </Card>
  );
}
