"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEventPopup } from "@/hooks/use-event-popup";

const EVENT_URL = "https://gameficacao.brunogusmao.dev";

export function EventPopup() {
  const pathname = usePathname();
  const { enabled, eventName, eventDescription, eventImageUrl, eventBgColor, eventTextColor } =
    useEventPopup();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/" && enabled) setOpen(true);
  }, [pathname, enabled]);

  if (!enabled) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPopup className="w-full max-w-md mx-4 sm:mx-auto overflow-hidden p-0">
        <div className="relative w-full">
          <Image
            src={eventImageUrl || "/og-image.png"}
            alt={eventName}
            width={1024}
            height={1536}
            className="h-auto w-full"
            priority
          />
        </div>
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>{eventName.toUpperCase()} ATIVO_</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-6">
            {eventDescription}
          </p>
          <Button
            className="w-full"
            style={{ backgroundColor: eventBgColor, color: eventTextColor }}
            render={
              <a href={EVENT_URL} target="_blank" rel="noopener noreferrer" />
            }
          >
            Participar do evento
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
