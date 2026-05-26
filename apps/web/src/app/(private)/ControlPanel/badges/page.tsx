import { BadgesTable } from "@/components/ControlPanel/badgesTable";
import { PanelHeader } from "@/components/ControlPanel/panelHeader";

export type Badge = {
  id: string;
  name: string;
  slug: string;
  bgColor: string;
  textColor: string;
  createdAt: string;
};

async function getBadges(): Promise<Badge[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/badges`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function BadgesPage() {
  const badges = await getBadges();

  return (
    <div className="flex flex-col min-h-screen">
      <PanelHeader title="BADGES_" description="Gerencie as tags de tecnologia" />
      <main className="flex-1 p-6">
        <BadgesTable initialBadges={badges} />
      </main>
    </div>
  );
}
