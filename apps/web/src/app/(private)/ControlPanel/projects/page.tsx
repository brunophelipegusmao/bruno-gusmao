import { ProjectsTable } from "@/components/ControlPanel/projectsTable";
import { PanelHeader } from "@/components/ControlPanel/panelHeader";
import type { Badge } from "@/app/(private)/ControlPanel/badges/page";
import { getSessionCookieHeader } from "@/lib/server-auth";

export type Project = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  image: string | null;
  projectUrl: string | null;
  repoUrl: string | null;
  badge1Id: string | null;
  badge2Id: string | null;
  badge3Id: string | null;
  visible: boolean;
  featured: boolean;
  kanbanStatus: string;
  createdAt: string;
  updatedAt: string;
};

async function getData() {
  const base = process.env.API_URL ?? "http://localhost:3001";
  const authHeaders = await getSessionCookieHeader();
  const [projects, badges] = await Promise.all([
    fetch(`${base}/api/projects/all`, { cache: "no-store", headers: authHeaders }).then((r) =>
      r.ok ? r.json() : []
    ),
    fetch(`${base}/api/badges`, { cache: "no-store" }).then((r) =>
      r.ok ? r.json() : []
    ),
  ]);
  return { projects: projects as Project[], badges: badges as Badge[] };
}

export default async function ProjectsPage() {
  const { projects, badges } = await getData();

  return (
    <div className="flex flex-col min-h-screen">
      <PanelHeader title="PROJETOS_" description="Cadastre e gerencie seus projetos" />
      <main className="flex-1 p-3 sm:p-6">
        <ProjectsTable initialProjects={projects} badges={badges} />
      </main>
    </div>
  );
}
