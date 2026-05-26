"use client";

import { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { FolderKanban, FileText, Sparkles, Plus, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { KanbanTask } from "@/app/(private)/ControlPanel/kanban/page";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const WS_URL = API.replace(/^http/, "ws");

const FIXED_COLORS = {
  blog: "#3C71C8",
  project: "#4c1d95",
};

function getAccent(task: KanbanTask): string {
  if (task.taskType === "custom") return task.color ?? "#6b7280";
  return FIXED_COLORS[task.taskType as keyof typeof FIXED_COLORS] ?? "#6b7280";
}

const COLUMNS = [
  {
    id: "backlog",
    label: "Backlog",
    color: "#6b7280",
    bg: "bg-muted/30",
    dragBg: "bg-muted/50",
    border: "border-border",
    dragBorder: "border-muted-foreground/40",
    dot: "bg-muted-foreground/40",
  },
  {
    id: "todo",
    label: "A Fazer",
    color: "#3b82f6",
    bg: "bg-blue-500/5",
    dragBg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dragBorder: "border-blue-500/50",
    dot: "bg-blue-400",
  },
  {
    id: "in-progress",
    label: "Em Andamento",
    color: "#f59e0b",
    bg: "bg-amber-500/5",
    dragBg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dragBorder: "border-amber-500/50",
    dot: "bg-amber-400",
  },
  {
    id: "done",
    label: "Concluído",
    color: "#10b981",
    bg: "bg-emerald-500/5",
    dragBg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dragBorder: "border-emerald-500/50",
    dot: "bg-emerald-400",
  },
];

const TASK_TYPE_META = [
  { value: "blog", label: "Blog", icon: FileText, color: FIXED_COLORS.blog },
  { value: "project", label: "Projeto", icon: FolderKanban, color: FIXED_COLORS.project },
  { value: "custom", label: "Livre", icon: Sparkles, color: null },
] as const;

type TaskForm = {
  title: string;
  description: string;
  taskType: "blog" | "project" | "custom";
  color: string;
};

const EMPTY_FORM: TaskForm = {
  title: "",
  description: "",
  taskType: "blog",
  color: "#e11d48",
};

function TaskDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: TaskForm;
  onSave: (form: TaskForm) => void;
  saving: boolean;
  mode: "create" | "edit";
}) {
  const [form, setForm] = useState<TaskForm>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const previewColor =
    form.taskType === "custom"
      ? form.color
      : FIXED_COLORS[form.taskType as keyof typeof FIXED_COLORS] ?? "#6b7280";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="w-full max-w-md mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "NOVA TAREFA_" : "EDITAR TAREFA_"}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
              Tipo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TASK_TYPE_META.map((t) => {
                const selected = form.taskType === t.value;
                const color = t.color ?? (selected ? form.color : "#6b7280");
                return (
                  <button
                    key={t.value}
                    onClick={() => setForm((f) => ({ ...f, taskType: t.value }))}
                    className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg text-xs font-heading uppercase tracking-wide transition-all ${
                      selected ? "border-2" : "border border-border text-muted-foreground"
                    }`}
                    style={
                      selected
                        ? { borderColor: color, color, backgroundColor: `${color}15` }
                        : undefined
                    }
                  >
                    <t.icon className="size-4" style={selected ? { color } : undefined} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color picker — só para Livre */}
          {form.taskType === "custom" && (
            <div className="flex flex-col gap-1.5">
              <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
                Cor do card
              </label>
              <div className="flex items-center gap-3 h-10 px-3 rounded-lg border border-border bg-background">
                <input
                  type="color"
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                />
                <span className="text-sm text-muted-foreground font-mono">{form.color}</span>
              </div>
            </div>
          )}

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
              Título
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Título da tarefa"
              autoFocus
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
              Descrição{" "}
              <span className="normal-case font-sans tracking-normal">(opcional)</span>
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detalhes da tarefa..."
            />
          </div>

          {/* Preview de cor */}
          <div
            className="h-1 rounded-full transition-all"
            style={{ backgroundColor: previewColor }}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(form)} disabled={saving || !form.title.trim()}>
            {saving ? "Salvando..." : mode === "create" ? "Criar tarefa" : "Salvar alterações"}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

export function KanbanBoard({ initialTasks }: { initialTasks: KanbanTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const wsRef = useRef<WebSocket | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState("backlog");
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<KanbanTask | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "card-moved") {
          const { id, to } = msg.data as { id: string; to: string };
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, kanbanStatus: to } : t)));
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const to = destination.droppableId;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task || task.kanbanStatus === to) return;

    setTasks((prev) => prev.map((t) => (t.id === draggableId ? { ...t, kanbanStatus: to } : t)));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ event: "move-card", data: { id: task.id, type: "task", to } })
      );
    }
  };

  const openCreate = (status: string) => {
    setCreateStatus(status);
    setCreateOpen(true);
  };

  const openEdit = (task: KanbanTask) => {
    setEditTarget(task);
    setEditOpen(true);
  };

  const handleCreate = async (form: TaskForm) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/kanban-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          taskType: form.taskType,
          color: form.taskType === "custom" ? form.color : null,
          kanbanStatus: createStatus,
        }),
      });
      if (res.ok) {
        const [created] = await res.json();
        setTasks((prev) => [...prev, created]);
        setCreateOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form: TaskForm) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/kanban-tasks/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          taskType: form.taskType,
          color: form.taskType === "custom" ? form.color : null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === editTarget.id ? updated : t)));
        setEditOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/kanban-tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
    }
  };

  const editInitial: TaskForm = editTarget
    ? {
        title: editTarget.title,
        description: editTarget.description ?? "",
        taskType: editTarget.taskType,
        color: editTarget.color ?? "#e11d48",
      }
    : EMPTY_FORM;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.kanbanStatus === col.id);
            return (
              <div key={col.id} className="flex flex-col gap-3 w-60 sm:w-72 shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full shrink-0 ${col.dot}`} />
                    <h2
                      className="font-heading uppercase text-sm tracking-wide"
                      style={{ color: col.color }}
                    >
                      {col.label}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-heading border"
                      style={{ color: col.color, borderColor: `${col.color}40`, backgroundColor: `${col.color}12` }}
                    >
                      {colTasks.length}
                    </span>
                    <button
                      onClick={() => openCreate(col.id)}
                      className="flex items-center justify-center size-5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Nova tarefa"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-2 min-h-30 rounded-xl p-2 border transition-colors ${
                        snapshot.isDraggingOver
                          ? `${col.dragBorder} ${col.dragBg}`
                          : `${col.border} ${col.bg}`
                      }`}
                    >
                      {colTasks.map((task, index) => {
                        const accent = getAccent(task);
                        const meta = TASK_TYPE_META.find((m) => m.value === task.taskType);
                        const Icon = meta?.icon ?? Sparkles;
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group/card flex flex-col gap-2 p-3 rounded-lg bg-background border border-border border-l-2 transition-shadow cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging ? "shadow-lg shadow-black/10" : ""
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  borderLeftColor: accent,
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Icon className="size-3.5 shrink-0" style={{ color: accent }} />
                                    <span
                                      className="text-xs font-heading uppercase tracking-wide"
                                      style={{ color: accent }}
                                    >
                                      {meta?.label ?? "Livre"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openEdit(task); }}
                                      className="text-muted-foreground/50 hover:text-primary transition-colors"
                                      title="Editar"
                                    >
                                      <Pencil className="size-3" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                      className="text-muted-foreground/50 hover:text-destructive transition-colors"
                                      title="Excluir"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm font-medium leading-snug">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={EMPTY_FORM}
        onSave={handleCreate}
        saving={saving}
        mode="create"
      />

      <TaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={editInitial}
        onSave={handleEdit}
        saving={saving}
        mode="edit"
      />
    </>
  );
}
