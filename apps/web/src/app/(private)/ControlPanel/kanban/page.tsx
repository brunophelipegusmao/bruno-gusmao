import { KanbanBoard } from "@/components/ControlPanel/kanbanBoard";
import { PanelHeader } from "@/components/ControlPanel/panelHeader";

export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  taskType: "blog" | "project" | "custom";
  color: string | null;
  kanbanStatus: string;
};

async function getTasks(): Promise<KanbanTask[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const res = await fetch(`${base}/api/kanban-tasks`, { cache: "no-store" });
  return res.ok ? res.json() : [];
}

export default async function KanbanPage() {
  const tasks = await getTasks();

  return (
    <div className="flex flex-col min-h-screen">
      <PanelHeader title="KANBAN_" description="Organize o fluxo de produção do seu conteúdo" />
      <main className="flex-1 p-3 sm:p-6 overflow-x-auto">
        <KanbanBoard initialTasks={tasks} />
      </main>
    </div>
  );
}
