import { ReactNode } from "react";
import { CommonBadge } from "./commonBadge";
import { Card } from "@/components/ui/card";
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
    <Card className="relative w-full aspect-video overflow-hidden p-0 gap-0 bg-secondary">
      <div className="absolute inset-0">
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover brightness-80 hover:grayscale dark:brightness-40"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/10 via-secondary to-primary/5 flex items-center justify-center">
            <span className="font-heading text-primary/20 text-2xl">IMG_</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="relative flex flex-col justify-end gap-3 h-full p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-white font-semibold text-base leading-snug line-clamp-1">{title}</h2>
          <p className="text-white/80 text-sm line-clamp-2">{description}</p>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {badges.map((b) => (
                <CommonBadge key={b.name} name={b.name} bgColor={b.bgColor} textColor={b.textColor} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-around w-full">{children}</div>
      </div>
    </Card>
  );
}
