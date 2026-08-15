"use client";

import { HyperText } from "@/components/ui/hyper-text";
import { useEventPopup } from "@/hooks/use-event-popup";

const EVENT_URL = "https://gameficacao.brunogusmao.dev";

export function EventButton() {
  const { enabled, eventName, eventBgColor, eventTextColor } =
    useEventPopup();

  if (!enabled) return null;

  return (
    <a href={EVENT_URL} target="_blank" rel="noopener noreferrer">
      <HyperText
        style={{ backgroundColor: eventBgColor, color: eventTextColor }}
        className="text-sm min-w-30 uppercase font-heading py-2 rounded-xl text-center transition-[filter] hover:brightness-90"
      >
        {eventName}
      </HyperText>
    </a>
  );
}
