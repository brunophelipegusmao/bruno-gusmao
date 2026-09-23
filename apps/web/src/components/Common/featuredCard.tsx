import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ShineBorder } from "@/components/ui/shine-border";
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
    <Card className="relative w-[50%] h-full overflow-hidden p-0 gap-0 bg-secondary">
      <ShineBorder shineColor={["#e2e8f0", "#818cf8", "#c4b5fd"]} className="z-40" />

      <div className="absolute inset-0">
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
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="relative flex flex-col justify-end gap-3 h-full p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-white font-semibold text-lg leading-snug line-clamp-1">{title}</h2>
          <p className="text-white/80 text-sm line-clamp-3">{description}</p>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {badges.map((b) => (
                <CommonBadge key={b.name} name={b.name} bgColor={b.bgColor} textColor={b.textColor} />
              ))}
            </div>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3">{children}</div>
        )}
      </div>
    </Card>
  );
}
