"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const DEFAULTS = {
  enabled: false,
  eventName: "Evento",
  eventDescription:
    "Tem um evento de gamificação rolando agora. Participe e concorra a prêmios!",
  eventImageUrl: null as string | null,
  eventBgColor: "#1e293b",
  eventTextColor: "#e2e8f0",
};

export function useEventPopup() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/site-settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setSettings({
          enabled: Boolean(data.eventPopupEnabled),
          eventName: data.eventName || DEFAULTS.eventName,
          eventDescription: data.eventDescription || DEFAULTS.eventDescription,
          eventImageUrl: data.eventImageUrl ?? null,
          eventBgColor: data.eventBgColor || DEFAULTS.eventBgColor,
          eventTextColor: data.eventTextColor || DEFAULTS.eventTextColor,
        });
      })
      .catch(() => setSettings(DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  return { ...settings, loading };
}
