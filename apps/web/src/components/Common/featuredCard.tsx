import { ReactNode } from "react";
import { Card } from "../ui/card";
import { ShineBorder } from "../ui/shine-border";
import { CommonBadge } from "./commonBadge";

export interface BadgeData {
  name: string;
  bgColor: string;
  textColor: string;
}

interface FeaturedCardProps {
  image?: { src: string; alt: string } | null;
  title: string;
  description: string;
  badges: BadgeData[];
  children?: ReactNode;
}

export default function FeaturedCard({
  image,
  title,
  description,
  badges,
  children,
}: FeaturedCardProps) {
  return (
    <Card className="relative w-full flex flex-col md:flex-row overflow-hidden pt-0 bg-secondary">
      <ShineBorder shineColor={["#e2e8f0", "#818cf8", "#c4b5fd"]} className="z-40" />

      <div className="relative w-full md:w-1/2 shrink-0 aspect-video md:aspect-auto">
        <div className="absolute inset-0 z-10 bg-black/20" />
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover brightness-80 hover:grayscale dark:brightness-40"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/20 via-secondary to-primary/5 flex items-center justify-center">
            <span className="font-heading text-primary/30 text-4xl">IMG_</span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 p-6 flex-1">
        <div className="flex flex-col gap-3">
          <h2 className="text-primary font-semibold text-lg leading-snug">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {badges.map((b) => (
                <CommonBadge key={b.name} name={b.name} bgColor={b.bgColor} textColor={b.textColor} />
              ))}
            </div>
          )}
        </div>
        {children && (
          <div className="flex items-center justify-center gap-3">{children}</div>
        )}
      </div>
    </Card>
  );
}
