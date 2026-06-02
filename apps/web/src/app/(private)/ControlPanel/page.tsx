import { SidebarTrigger } from "@/components/ui/sidebar";
import { FolderKanban, FileText, Tag, CircleDot, ListTodo, Timer, CheckCircle2 } from "lucide-react";
import { getSessionCookieHeader } from "@/lib/server-auth";

type KanbanTask = { kanbanStatus: string };

async function getStats() {
  const base = process.env.API_URL ?? "http://localhost:3001";
  const authHeaders = await getSessionCookieHeader();
  const [projects, posts, badges, tasks] = await Promise.all([
    fetch(`${base}/api/projects/all`, { cache: "no-store", headers: authHeaders }).then((r) =>
      r.ok ? r.json() : []
    ),
    fetch(`${base}/api/posts/all`, { cache: "no-store", headers: authHeaders }).then((r) =>
      r.ok ? r.json() : []
    ),
    fetch(`${base}/api/badges`, { cache: "no-store" }).then((r) =>
      r.ok ? r.json() : []
    ),
    fetch(`${base}/api/kanban-tasks`, { cache: "no-store" }).then((r) =>
      r.ok ? r.json() : []
    ),
  ]);

  return {
    projects: projects as { visible: boolean }[],
    posts: posts as { visible: boolean }[],
    badges: badges as unknown[],
    tasks: tasks as KanbanTask[],
  };
}

function StatCard({
  label,
  icon: Icon,
  total,
  sub,
  accent,
}: {
  label: string;
  icon: React.ElementType;
  total: number;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl bg-secondary border border-border">
      <div className="flex items-center justify-between">
        <span className="font-heading uppercase text-xs text-muted-foreground tracking-wide">
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground" style={accent ? { color: accent } : undefined} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-heading text-3xl sm:text-4xl text-primary" style={accent ? { color: accent } : undefined}>
          {total}
        </span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

export default async function ControlPanel() {
  const { projects, posts, badges, tasks } = await getStats();

  const count = (status: string) => tasks.filter((t) => t.kanbanStatus === status).length;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <SidebarTrigger />
        <h1 className="font-heading text-primary text-2xl">DASHBOARD_</h1>
      </header>

      <main className="flex-1 p-3 sm:p-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Projetos" icon={FolderKanban} total={projects.length} sub={`${projects.filter((p) => p.visible).length} públicos`} />
          <StatCard label="Posts" icon={FileText} total={posts.length} sub={`${posts.filter((p) => p.visible).length} públicos`} />
          <StatCard label="Badges" icon={Tag} total={badges.length} sub="criadas" />
        </div>

        <div>
          <h2 className="font-heading uppercase text-xs text-muted-foreground tracking-widest mb-3">KANBAN_</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Backlog"      icon={CircleDot}    total={count("backlog")}     sub="tarefas" accent="#6b7280" />
            <StatCard label="A Fazer"      icon={ListTodo}     total={count("todo")}        sub="tarefas" accent="#3b82f6" />
            <StatCard label="Em Andamento" icon={Timer}        total={count("in-progress")} sub="tarefas" accent="#f59e0b" />
            <StatCard label="Concluído"    icon={CheckCircle2} total={count("done")}        sub="tarefas" accent="#10b981" />
          </div>
        </div>
      </main>
    </div>
  );
}
