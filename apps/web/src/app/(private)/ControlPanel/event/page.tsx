import { EventSettingsForm } from "@/components/ControlPanel/eventSettingsForm";
import { PanelHeader } from "@/components/ControlPanel/panelHeader";
import { getSessionCookieHeader } from "@/lib/server-auth";

async function getData() {
  const base = process.env.API_URL ?? "http://localhost:3001";
  const authHeaders = await getSessionCookieHeader();
  const res = await fetch(`${base}/api/site-settings`, {
    cache: "no-store",
    headers: authHeaders,
  });
  return res.ok ? res.json() : { eventPopupEnabled: false };
}

export default async function EventPage() {
  const settings = await getData();

  return (
    <div className="flex flex-col min-h-screen">
      <PanelHeader
        title="EVENTO_"
        description="Ativar ou desativar a divulgação do evento"
      />
      <main className="flex-1 p-3 sm:p-6">
        <EventSettingsForm initialEnabled={settings.eventPopupEnabled} />
      </main>
    </div>
  );
}
