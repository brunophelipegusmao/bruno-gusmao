"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CommonBadge } from "@/components/Common/commonBadge";
import type { Badge } from "@/app/(private)/ControlPanel/badges/page";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const EMPTY: Omit<Badge, "id" | "createdAt"> = {
  name: "",
  slug: "",
  bgColor: "#1e293b",
  textColor: "#e2e8f0",
};

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
      <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-3 h-10 px-3 rounded-lg border border-border bg-background">
        <input
          type="color"
          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="text-sm text-muted-foreground font-mono flex-1">{value}</span>
      </div>
    </div>
  );
}

export function BadgesTable({ initialBadges }: { initialBadges: Badge[] }) {
  const [badges, setBadges] = useState(initialBadges);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof EMPTY, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (b: Badge) => {
    setForm({ name: b.name, slug: b.slug, bgColor: b.bgColor, textColor: b.textColor });
    setEditId(b.id);
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editId) {
        const res = await fetch(`${API}/api/badges/${editId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          credentials: "include", body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setBadges((prev) => prev.map((b) => (b.id === editId ? updated : b)));
        }
      } else {
        const res = await fetch(`${API}/api/badges`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          credentials: "include", body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setBadges((prev) => [...prev, created[0]]);
        }
      }
      setOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta badge?")) return;
    const res = await fetch(`${API}/api/badges/${id}`, {
      method: "DELETE", credentials: "include",
    });
    if (res.ok) setBadges((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{badges.length} badge{badges.length !== 1 ? "s" : ""} cadastrada{badges.length !== 1 ? "s" : ""}</p>
        <Button onClick={openCreate} className="font-heading uppercase gap-2 text-xs">
          <Plus className="size-3.5" />
          Nova Badge
        </Button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="font-heading text-xs uppercase tracking-widest">Preview</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest">Nome</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest">Slug</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest">Cores</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {badges.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Tag className="size-8 opacity-20" />
                    <span className="text-sm">Nenhuma badge cadastrada</span>
                    <Button variant="outline" size="sm" onClick={openCreate} className="text-xs font-heading uppercase">
                      Criar a primeira
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {badges.map((b) => (
              <TableRow key={b.id} className="group">
                <TableCell>
                  <CommonBadge name={b.name} bgColor={b.bgColor} textColor={b.textColor} />
                </TableCell>
                <TableCell className="font-medium text-sm">{b.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{b.slug}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-5 h-5 rounded-md border border-border"
                        style={{ backgroundColor: b.bgColor }}
                        title={`BG: ${b.bgColor}`}
                      />
                      <span
                        className="inline-block w-5 h-5 rounded-md border border-border"
                        style={{ backgroundColor: b.textColor }}
                        title={`Texto: ${b.textColor}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono hidden lg:block">{b.bgColor}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(b)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPopup className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{editId ? "EDITAR BADGE_" : "NOVA BADGE_"}</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* Nome + Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
                  Nome
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                  value={form.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({ ...f, name: v, slug: toSlug(v) }));
                  }}
                  placeholder="TypeScript"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
                  Slug
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                  value={form.slug}
                  onChange={(e) => set("slug", toSlug(e.target.value))}
                  placeholder="typescript"
                />
              </div>
            </div>

            {/* Cores */}
            <div className="grid grid-cols-2 gap-4">
              <ColorField
                label="Cor de fundo"
                value={form.bgColor}
                onChange={(v) => set("bgColor", v)}
              />
              <ColorField
                label="Cor do texto"
                value={form.textColor}
                onChange={(v) => set("textColor", v)}
              />
            </div>

            {/* Preview */}
            <div className="flex flex-col gap-1.5">
              <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
                Preview
              </label>
              <div className="flex items-center justify-center p-6 rounded-xl bg-secondary border border-border">
                <CommonBadge
                  name={form.name || "preview"}
                  bgColor={form.bgColor}
                  textColor={form.textColor}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading || !form.name}>
              {loading ? "Salvando..." : editId ? "Salvar alterações" : "Criar badge"}
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </>
  );
}
