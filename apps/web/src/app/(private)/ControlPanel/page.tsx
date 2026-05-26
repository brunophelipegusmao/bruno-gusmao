import { SidebarTrigger } from "@/components/ui/sidebar";
import { FolderKanban, FileText, Tag, Kanban } from "lucide-react";

async function getStats() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const [projects, posts, badges] = await Promise.all([
    fetch(`${base}/api/projects/all`, { cache: "no-store" }).then((r) =>
      r.ok ? r.json() : []
    ),
    fetch(`${base}/api/posts/all`, { cache: "no-store" }).then((r) =>
      r.ok ? r.json() : []
    ),
    fetch(`${base}/api/badges`, { cache: "no-store" }).then((r) =>
      r.ok ? r.json() : []
    ),
  ]);

  return {
    projects: (projects as { visible: boolean; kanbanStatus: string }[]),
    posts: (posts as { visible: boolean; kanbanStatus: string }[]),
    badges: (badges as unknown[]),
  };
}

export default async function ControlPanel() {
  const { projects, posts, badges } = await getStats();

  const stats = [
    {
      label: "Projetos",
      icon: FolderKanban,
      total: projects.length,
      sub: `${projects.filter((p) => p.visible).length} públicos`,
    },
    {
      label: "Posts",
      icon: FileText,
      total: posts.length,
      sub: `${posts.filter((p) => p.visible).length} públicos`,
    },
    {
      label: "Badges",
      icon: Tag,
      total: badges.length,
      sub: "criadas",
    },
    {
      label: "No Kanban",
      icon: Kanban,
      total: [...projects, ...posts].filter(
        (i) => i.kanbanStatus !== "backlog"
      ).length,
      sub: "em andamento",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <SidebarTrigger />
        <h1 className="font-heading text-primary text-2xl">DASHBOARD_</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, icon: Icon, total, sub }) => (
            <div
              key={label}
              className="flex flex-col gap-3 p-5 rounded-xl bg-secondary border border-border"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading uppercase text-xs text-muted-foreground tracking-wide">
                  {label}
                </span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-4xl text-primary">
                  {total}
                </span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
