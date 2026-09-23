"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Plus, Trash2, Users, User } from "lucide-react";
import { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogCloseButton } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/use-toast";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors";
const labelClass = "font-heading text-xs uppercase tracking-widest text-muted-foreground";

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  shared: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

function TodoRow({ todo, onToggle, onDelete }: { todo: Todo; onToggle: (t: Todo) => void; onDelete: (id: string) => void }) {
  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 p-3 transition-colors hover:bg-card/70">
      <Checkbox checked={todo.done} onCheckedChange={() => onToggle(todo)} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium leading-snug ${todo.done ? "text-muted-foreground line-through" : ""}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{todo.description}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function TodosBoard({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [tab, setTab] = useState<"mine" | "shared">("mine");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast, Toaster } = useToast();

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/todos`);
    ws.onmessage = (event) => {
      try {
        const { event: type, data } = JSON.parse(event.data) as { event: string; data: Todo };
        setTodos((prev) => {
          if (type === "todo-created") {
            return prev.some((t) => t.id === data.id) ? prev : [...prev, data];
          }
          if (type === "todo-updated") {
            return prev.map((t) => (t.id === data.id ? data : t));
          }
          if (type === "todo-deleted") {
            return prev.filter((t) => t.id !== data.id);
          }
          return prev;
        });
      } catch {}
    };
    return () => ws.close();
  }, []);

  const mine = useMemo(() => todos.filter((t) => !t.shared), [todos]);
  const shared = useMemo(() => todos.filter((t) => t.shared), [todos]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/todos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          shared: tab === "shared",
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTodos((prev) => (prev.some((t) => t.id === created.id) ? prev : [...prev, created]));
      toast("Tarefa criada");
      setTitle("");
      setDescription("");
      setOpen(false);
    } catch {
      toast("Erro ao criar tarefa", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    const res = await fetch(`${API}/api/todos/${todo.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    if (!res.ok) return toast("Erro ao atualizar tarefa", "error");
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${API}/api/todos/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return toast("Erro ao deletar tarefa", "error");
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast("Tarefa deletada");
    setConfirmDelete(null);
  };

  const list = tab === "mine" ? mine : shared;

  return (
    <>
      <Toaster />
      <Tabs value={tab} onValueChange={(v) => setTab(v as "mine" | "shared")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTab value="mine" className="flex items-center gap-1.5">
              <User className="size-3.5" /> Meus
            </TabsTab>
            <TabsTab value="shared" className="flex items-center gap-1.5">
              <Users className="size-3.5" /> Compartilhados
            </TabsTab>
            <TabsIndicator />
          </TabsList>
          <Button onClick={() => setOpen(true)} className="gap-2 text-xs">
            <Plus className="size-3.5" /> Nova tarefa
          </Button>
        </div>

        <TabsPanel value="mine" className="flex flex-col gap-2">
          {mine.length === 0 && (
            <div className="py-16 text-center">
              <CheckSquare className="mx-auto size-8 opacity-20" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma tarefa privada</p>
            </div>
          )}
          {mine.map((t) => (
            <TodoRow key={t.id} todo={t} onToggle={handleToggle} onDelete={(id) => setConfirmDelete(id)} />
          ))}
        </TabsPanel>

        <TabsPanel value="shared" className="flex flex-col gap-2">
          {shared.length === 0 && (
            <div className="py-16 text-center">
              <Users className="mx-auto size-8 opacity-20" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma tarefa compartilhada</p>
            </div>
          )}
          {shared.map((t) => (
            <TodoRow key={t.id} todo={t} onToggle={handleToggle} onDelete={(id) => setConfirmDelete(id)} />
          ))}
        </TabsPanel>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPopup className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tab === "shared" ? "NOVA TAREFA COMPARTILHADA" : "NOVA TAREFA"}</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Título</label>
              <input
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="O que precisa ser feito?"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Descrição <span className="normal-case font-sans">(opcional)</span></label>
              <textarea
                className={`${inputClass} min-h-[80px] resize-none`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes da tarefa..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !title.trim()}>
              {saving ? "Salvando..." : "Criar tarefa"}
            </Button>
          </div>
        </DialogPopup>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title="Deletar tarefa?"
        description="Essa ação remove a tarefa permanentemente."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        confirmText="Deletar"
      />
    </>
  );
}
