import { EventSettingsForm } from "@/components/ControlPanel/eventSettingsForm";
import { PanelHeader } from "@/components/ControlPanel/panelHeader";
import { getSessionCookieHeader } from "@/lib/server-auth";

const DEFAULT_SETTINGS = {
  eventPopupEnabled: false,
  eventName: "Evento",
  eventDescription: null,
  eventImageUrl: null,
  eventBgColor: "#1e293b",
  eventTextColor: "#e2e8f0",
};

async function getData() {
  const base = process.env.API_URL ?? "http://localhost:3001";
  const authHeaders = await getSessionCookieHeader();
  const res = await fetch(`${base}/api/site-settings`, {
    cache: "no-store",
    headers: authHeaders,
  });
  return res.ok ? res.json() : DEFAULT_SETTINGS;
}

export default async function EventPage() {
  const settings = await getData();

  return (
    <div className="flex flex-col min-h-screen">
      <PanelHeader
        title="EVENTO_"
        description="Estilizar e ativar ou desativar a divulgação do evento"
      />
      <main className="flex-1 p-3 sm:p-6">
        <EventSettingsForm initial={{ ...DEFAULT_SETTINGS, ...settings }} />
      </main>
    </div>
  );
}
