"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function EventSettingsForm({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  const toggle = async (value: boolean) => {
    setEnabled(value);
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/site-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventPopupEnabled: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEnabled(updated.eventPopupEnabled);
      } else {
        setEnabled(!value);
      }
    } catch {
      setEnabled(!value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border p-5 max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-sm uppercase tracking-widest">
            Popup do evento
          </span>
          <span className="text-xs text-muted-foreground max-w-sm">
            Quando ativo, exibe um popup na home divulgando o evento de
            gamificação (gameficacao.brunogusmao.dev) e mostra o botão
            &quot;Evento&quot; no header.
          </span>
        </div>
        <Switch checked={enabled} onCheckedChange={toggle} disabled={saving} />
      </div>
    </div>
  );
}
