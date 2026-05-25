import { ReactNode } from "react";
import { Card } from "../ui/card";
import { ShineBorder } from "../ui/shine-border";
import { Badge } from "../ui/badge";

interface FeaturedCardProps {
  image: { src: string; alt: string };
  title: string;
  description: string;
  badges: string[];
  children: ReactNode;
}

export default function FeaturedCard({
  image,
  title,
  description,
  badges,
  children,
}: FeaturedCardProps) {
  return (
    <Card className="relative w-full flex flex-row overflow-hidden pt-0 bg-secondary">
      <ShineBorder
        shineColor={["#e2e8f0", "#818cf8", "#c4b5fd"]}
        className="z-40"
      />

      <div className="relative w-1/2 shrink-0">
        <div className="absolute inset-0 z-10 bg-black/20" />
        <img
          src={image.src}
          alt={image.alt}
          className="w-full h-full object-cover brightness-80 hover:grayscale dark:brightness-40"
        />
      </div>

      <div className="flex flex-col justify-between gap-4 p-6 flex-1">
        <div className="flex flex-col gap-3">
          <h2 className="text-primary font-semibold text-lg leading-snug">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm">{description}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">{children}</div>
      </div>
    </Card>
  );
}
