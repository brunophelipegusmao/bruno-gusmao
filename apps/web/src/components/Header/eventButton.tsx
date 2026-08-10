"use client";

import { Button } from "@/components/ui/button";
import { useEventPopup } from "@/hooks/use-event-popup";

const EVENT_URL = "https://gameficacao.brunogusmao.dev";

export function EventButton() {
  const { enabled } = useEventPopup();

  if (!enabled) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      render={
        <a href={EVENT_URL} target="_blank" rel="noopener noreferrer" />
      }
    >
      Evento
    </Button>
  );
}
