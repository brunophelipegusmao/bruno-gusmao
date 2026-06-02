import { PostsTable } from "@/components/ControlPanel/postsTable";
import { PanelHeader } from "@/components/ControlPanel/panelHeader";
import type { Badge } from "@/app/(private)/ControlPanel/badges/page";
import { getSessionCookieHeader } from "@/lib/server-auth";

export type Post = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  content: string;
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
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const authHeaders = await getSessionCookieHeader();
  const [posts, badges] = await Promise.all([
    fetch(`${base}/api/posts/all`, { cache: "no-store", headers: authHeaders }).then((r) =>
      r.ok ? r.json() : []
    ),
    fetch(`${base}/api/badges`, { cache: "no-store" }).then((r) =>
      r.ok ? r.json() : []
    ),
  ]);
  return { posts: posts as Post[], badges: badges as Badge[] };
}

export default async function PostsPage() {
  const { posts, badges } = await getData();

  return (
    <div className="flex flex-col min-h-screen">
      <PanelHeader title="POSTS_" description="Escreva e publique seus artigos" />
      <main className="flex-1 p-3 sm:p-6">
        <PostsTable initialPosts={posts} badges={badges} />
      </main>
    </div>
  );
}
