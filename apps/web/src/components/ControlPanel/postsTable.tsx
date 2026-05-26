"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Eye, EyeOff, FileText } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { CommonBadge } from "@/components/Common/commonBadge";
import type { Post } from "@/app/(private)/ControlPanel/posts/page";
import type { Badge } from "@/app/(private)/ControlPanel/badges/page";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const KANBAN_COLORS: Record<string, string> = {
  backlog: "text-muted-foreground bg-muted/40",
  todo: "text-blue-400 bg-blue-400/10",
  "in-progress": "text-amber-400 bg-amber-400/10",
  done: "text-emerald-400 bg-emerald-400/10",
};

const KANBAN_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "A fazer",
  "in-progress": "Em andamento",
  done: "Concluído",
};

const EMPTY = {
  name: "",
  slug: "",
  summary: "",
  imageUrl: "",
  content: "",
  badge1Id: "",
  badge2Id: "",
  badge3Id: "",
  visible: true,
  kanbanStatus: "backlog",
};

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
      {children}
    </label>
  );
}

export function PostsTable({
  initialPosts,
  badges,
}: {
  initialPosts: Post[];
  badges: Badge[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const badgeMap = Object.fromEntries(badges.map((b) => [b.id, b]));
  const set = (key: keyof typeof EMPTY, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => { setForm(EMPTY); setEditId(null); setOpen(true); };

  const openEdit = (p: Post) => {
    setForm({
      name: p.name, slug: p.slug, summary: p.summary,
      imageUrl: p.imageUrl ?? "", content: p.content,
      badge1Id: p.badge1Id ?? "", badge2Id: p.badge2Id ?? "",
      badge3Id: p.badge3Id ?? "", visible: p.visible,
      kanbanStatus: p.kanbanStatus,
    });
    setEditId(p.id);
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const body = {
      ...form,
      imageUrl: form.imageUrl || null,
      badge1Id: form.badge1Id || null,
      badge2Id: form.badge2Id || null,
      badge3Id: form.badge3Id || null,
    };
    try {
      if (editId) {
        const res = await fetch(`${API}/api/posts/${editId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          credentials: "include", body: JSON.stringify(body),
        });
        if (res.ok) {
          const updated = await res.json();
          setPosts((prev) => prev.map((p) => (p.id === editId ? updated : p)));
        }
      } else {
        const res = await fetch(`${API}/api/posts`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          credentials: "include", body: JSON.stringify(body),
        });
        if (res.ok) {
          const created = await res.json();
          setPosts((prev) => [...prev, created[0]]);
        }
      }
      setOpen(false);
    } finally { setLoading(false); }
  };

  const toggleVisible = async (p: Post) => {
    const res = await fetch(`${API}/api/posts/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ visible: !p.visible }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este post?")) return;
    const res = await fetch(`${API}/api/posts/${id}`, {
      method: "DELETE", credentials: "include",
    });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const getBadgesForPost = (p: Post) =>
    [p.badge1Id, p.badge2Id, p.badge3Id].filter(Boolean).map((id) => badgeMap[id!]).filter(Boolean);

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{posts.length} post{posts.length !== 1 ? "s" : ""} cadastrado{posts.length !== 1 ? "s" : ""}</p>
        <Button onClick={openCreate} className="font-heading uppercase gap-2 text-xs">
          <Plus className="size-3.5" />
          Novo Post
        </Button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="font-heading text-xs uppercase tracking-widest">Nome</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest">Summary</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest">Badges</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest">Status</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest">Visível</TableHead>
              <TableHead className="font-heading text-xs uppercase tracking-widest text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="size-8 opacity-20" />
                    <span className="text-sm">Nenhum post cadastrado</span>
                    <Button variant="outline" size="sm" onClick={openCreate} className="text-xs font-heading uppercase">
                      Escrever o primeiro
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {posts.map((p) => (
              <TableRow key={p.id} className="group">
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{p.slug}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs max-w-48 truncate">{p.summary}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {getBadgesForPost(p).map((b) => (
                      <CommonBadge key={b.id} name={b.name} bgColor={b.bgColor} textColor={b.textColor} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-heading uppercase tracking-wide ${KANBAN_COLORS[p.kanbanStatus] ?? "text-muted-foreground"}`}>
                    {KANBAN_LABELS[p.kanbanStatus] ?? p.kanbanStatus}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={p.visible} onCheckedChange={() => toggleVisible(p)} />
                    {p.visible
                      ? <Eye className="size-3.5 text-emerald-400" />
                      : <EyeOff className="size-3.5 text-muted-foreground" />}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(p)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
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
        <DialogPopup className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "EDITAR POST_" : "NOVO POST_"}</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* Nome + Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Nome</FieldLabel>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))}
                  placeholder="Meu Post"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Slug</FieldLabel>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                  value={form.slug}
                  onChange={(e) => set("slug", toSlug(e.target.value))}
                  placeholder="meu-post"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Summary <span className="normal-case font-sans tracking-normal">(máx. 300 chars)</span></FieldLabel>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                value={form.summary}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="Descrição breve do post"
                maxLength={300}
              />
              <span className="text-xs text-muted-foreground text-right">{form.summary.length}/300</span>
            </div>

            {/* Image URL */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>URL da Imagem de Capa</FieldLabel>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <FieldLabel>Conteúdo (Markdown)</FieldLabel>
                <span className="text-xs text-muted-foreground">{form.content.length} chars</span>
              </div>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors resize-none font-mono"
                rows={8}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder={`# Título do Post\n\n## Introdução\n\nEscreva o conteúdo em Markdown...`}
              />
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Badges <span className="normal-case font-sans tracking-normal">(até 3)</span></FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {(["badge1Id", "badge2Id", "badge3Id"] as const).map((key, i) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{i + 1}ª badge</span>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                    >
                      <option value="">— nenhuma —</option>
                      {badges.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {[form.badge1Id, form.badge2Id, form.badge3Id].some(Boolean) && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[form.badge1Id, form.badge2Id, form.badge3Id].filter(Boolean).map((id) => {
                    const b = badgeMap[id];
                    return b ? <CommonBadge key={id} name={b.name} bgColor={b.bgColor} textColor={b.textColor} /> : null;
                  })}
                </div>
              )}
            </div>

            {/* Status + Visível */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Status Kanban</FieldLabel>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                  value={form.kanbanStatus}
                  onChange={(e) => set("kanbanStatus", e.target.value)}
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">A fazer</option>
                  <option value="in-progress">Em andamento</option>
                  <option value="done">Concluído</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Visibilidade</FieldLabel>
                <div className="flex items-center gap-3 h-10 px-3 rounded-lg border border-border bg-background">
                  <Switch checked={form.visible} onCheckedChange={(v) => set("visible", v)} />
                  <span className="text-sm text-muted-foreground">
                    {form.visible ? "Visível ao público" : "Oculto ao público"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading || !form.name || !form.content || !form.summary}>
              {loading ? "Salvando..." : editId ? "Salvar alterações" : "Publicar post"}
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </>
  );
}
