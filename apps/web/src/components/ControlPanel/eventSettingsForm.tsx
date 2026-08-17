"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type EventSettings = {
  eventPopupEnabled: boolean;
  eventName: string;
  eventDescription: string | null;
  eventImageUrl: string | null;
  eventBgColor: string;
  eventTextColor: string;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
      {children}
    </label>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3 h-10 px-3 rounded-lg border border-border bg-background">
        <input
          type="color"
          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="text-sm text-muted-foreground font-mono flex-1">
          {value}
        </span>
      </div>
    </div>
  );
}

export function EventSettingsForm({ initial }: { initial: EventSettings }) {
  const [enabled, setEnabled] = useState(initial.eventPopupEnabled);
  const [form, setForm] = useState({
    eventName: initial.eventName,
    eventDescription: initial.eventDescription ?? "",
    eventImageUrl: initial.eventImageUrl ?? "",
    eventBgColor: initial.eventBgColor,
    eventTextColor: initial.eventTextColor,
  });
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggle = async (value: boolean) => {
    setEnabled(value);
    setToggling(true);
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
      setToggling(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${API}/api/site-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventName: form.eventName || "Evento",
          eventDescription: form.eventDescription || null,
          eventImageUrl: form.eventImageUrl || null,
          eventBgColor: form.eventBgColor,
          eventTextColor: form.eventTextColor,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-heading text-sm uppercase tracking-widest">
              Popup do evento
            </span>
            <span className="text-xs text-muted-foreground max-w-sm">
              Quando ativo, exibe um popup na home divulgando o evento e
              mostra o botão do evento no header.
            </span>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={toggle}
            disabled={toggling}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Nome do evento</FieldLabel>
          <FieldInput
            value={form.eventName}
            onChange={(v) => set("eventName", v)}
            placeholder="Evento"
          />
          <span className="text-xs text-muted-foreground">
            Texto exibido no botão do header e no título do popup.
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>
            Texto do popup{" "}
            <span className="normal-case font-sans tracking-normal">
              (máx. 500 chars)
            </span>
          </FieldLabel>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors resize-none"
            rows={3}
            maxLength={500}
            value={form.eventDescription}
            onChange={(e) => set("eventDescription", e.target.value)}
            placeholder="Tem um evento rolando agora. Participe e concorra a prêmios!"
          />
          <span className="text-xs text-muted-foreground text-right">
            {form.eventDescription.length}/500
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>URL da imagem do popup</FieldLabel>
          <FieldInput
            value={form.eventImageUrl}
            onChange={(v) => set("eventImageUrl", v)}
            placeholder="https://..."
          />
          <p className="text-xs text-muted-foreground">
            Imagem vertical (proporção 2:3), ex.: 1024×1536 — é exibida em
            torno de 400–450px de largura no popup, então uma resolução
            maior mantém a nitidez em telas retina.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorField
            label="Cor de fundo"
            value={form.eventBgColor}
            onChange={(v) => set("eventBgColor", v)}
          />
          <ColorField
            label="Cor do texto"
            value={form.eventTextColor}
            onChange={(v) => set("eventTextColor", v)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>Pré-visualização do botão</FieldLabel>
          <div className="flex items-center h-16 px-4 rounded-lg border border-border bg-secondary/30">
            <HyperText
              style={{
                backgroundColor: form.eventBgColor,
                color: form.eventTextColor,
              }}
              className="text-sm min-w-30 uppercase font-heading py-2 rounded-xl text-center"
            >
              {form.eventName || "Evento"}
            </HyperText>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          {saved && (
            <span className="text-xs text-emerald-400 self-center mr-auto">
              Salvo!
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
